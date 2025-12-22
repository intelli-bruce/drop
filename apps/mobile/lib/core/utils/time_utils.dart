/// Format a date as relative time (Korean)
String formatRelativeTime(DateTime date) {
  final now = DateTime.now();
  final diff = now.difference(date);
  final seconds = diff.inSeconds;
  final minutes = diff.inMinutes;

  if (seconds < 60) return '$seconds초전';
  if (minutes < 60) return '$minutes분전';

  final today = DateTime(now.year, now.month, now.day);
  final dateDay = DateTime(date.year, date.month, date.day);
  final yesterday = today.subtract(const Duration(days: 1));

  final hour = date.hour.toString().padLeft(2, '0');
  final minute = date.minute.toString().padLeft(2, '0');
  final time = '$hour:$minute';

  if (dateDay == today) return '오늘 $time';
  if (dateDay == yesterday) return '어제 $time';

  return '${date.year}. ${date.month}. ${date.day}.';
}
