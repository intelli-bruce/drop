/// Secrets configuration
/// Create secrets.local.dart with actual values (gitignored)
class Secrets {
  static const String openAIAPIKey = String.fromEnvironment(
    'OPENAI_API_KEY',
    defaultValue: '',
  );
}
