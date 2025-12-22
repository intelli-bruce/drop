import 'package:go_router/go_router.dart';
import 'package:throw_mobile/presentation/screens/home_screen.dart';

final router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      name: 'home',
      builder: (context, state) => const HomeScreen(),
    ),
  ],
);
