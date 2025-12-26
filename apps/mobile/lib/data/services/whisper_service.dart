import 'dart:io';

import 'package:dio/dio.dart';
import 'package:drop_mobile/core/config/secrets.dart';

/// OpenAI Whisper transcription service
class WhisperService {
  final Dio _dio;
  final String _apiKey;
  final String _endpoint;
  final String _model;

  WhisperService({
    Dio? dio,
    String? apiKey,
    String endpoint = 'https://api.openai.com/v1/audio/transcriptions',
    String model = 'whisper-1',
  })  : _dio = dio ?? Dio(),
        _apiKey = apiKey ?? Secrets.openAIAPIKey,
        _endpoint = endpoint,
        _model = model;

  /// Transcribe audio file to text
  Future<String> transcribe({
    required String audioPath,
    String? language,
    int retryCount = 3,
  }) async {
    final file = File(audioPath);
    if (!file.existsSync()) {
      throw WhisperException.fileNotFound();
    }

    if (_apiKey.isEmpty) {
      throw WhisperException.invalidApiKey();
    }

    WhisperException? lastError;

    for (var attempt = 0; attempt < retryCount; attempt++) {
      try {
        return await _performTranscription(audioPath, language);
      } on WhisperException catch (e) {
        if (e.type == WhisperErrorType.rateLimited ||
            e.type == WhisperErrorType.serverError) {
          // Exponential backoff
          final delay = Duration(seconds: 1 << attempt);
          await Future.delayed(delay);
          lastError = e;
        } else {
          rethrow;
        }
      }
    }

    throw lastError ?? WhisperException.networkError('Unknown error');
  }

  Future<String> _performTranscription(String audioPath, String? language) async {
    final formData = FormData.fromMap({
      'model': _model,
      'response_format': 'json',
      if (language != null) 'language': language,
      'file': await MultipartFile.fromFile(
        audioPath,
        filename: 'audio.m4a',
        contentType: DioMediaType('audio', 'm4a'),
      ),
    });

    try {
      final response = await _dio.post<Map<String, dynamic>>(
        _endpoint,
        data: formData,
        options: Options(
          headers: {
            'Authorization': 'Bearer $_apiKey',
          },
        ),
      );

      final data = response.data;
      if (data != null && data.containsKey('text')) {
        return data['text'] as String;
      }
      throw WhisperException.decodingError();
    } on DioException catch (e) {
      final statusCode = e.response?.statusCode;

      if (statusCode == 401) {
        throw WhisperException.invalidApiKey();
      } else if (statusCode == 429) {
        throw WhisperException.rateLimited();
      } else if (statusCode != null && statusCode >= 500) {
        throw WhisperException.serverError(statusCode);
      }

      // Try to parse error message from response
      final data = e.response?.data;
      if (data is Map<String, dynamic> && data.containsKey('error')) {
        final error = data['error'] as Map<String, dynamic>;
        throw WhisperException.apiError(error['message'] as String? ?? 'Unknown error');
      }

      throw WhisperException.networkError(e.message ?? 'Network error');
    }
  }
}

enum WhisperErrorType {
  invalidUrl,
  invalidApiKey,
  fileNotFound,
  networkError,
  apiError,
  decodingError,
  rateLimited,
  serverError,
}

class WhisperException implements Exception {
  final WhisperErrorType type;
  final String message;
  final int? statusCode;

  WhisperException._({
    required this.type,
    required this.message,
    this.statusCode,
  });

  factory WhisperException.invalidUrl() => WhisperException._(
        type: WhisperErrorType.invalidUrl,
        message: 'Invalid API URL',
      );

  factory WhisperException.invalidApiKey() => WhisperException._(
        type: WhisperErrorType.invalidApiKey,
        message: 'Invalid API key',
      );

  factory WhisperException.fileNotFound() => WhisperException._(
        type: WhisperErrorType.fileNotFound,
        message: 'Audio file not found',
      );

  factory WhisperException.networkError(String detail) => WhisperException._(
        type: WhisperErrorType.networkError,
        message: 'Network error: $detail',
      );

  factory WhisperException.apiError(String detail) => WhisperException._(
        type: WhisperErrorType.apiError,
        message: 'API error: $detail',
      );

  factory WhisperException.decodingError() => WhisperException._(
        type: WhisperErrorType.decodingError,
        message: 'Failed to decode response',
      );

  factory WhisperException.rateLimited() => WhisperException._(
        type: WhisperErrorType.rateLimited,
        message: 'Rate limited. Please try again later.',
      );

  factory WhisperException.serverError(int code) => WhisperException._(
        type: WhisperErrorType.serverError,
        message: 'Server error (code: $code)',
        statusCode: code,
      );

  @override
  String toString() => message;
}
