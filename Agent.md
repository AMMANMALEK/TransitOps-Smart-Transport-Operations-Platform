# TransitOps — Agent Rules

Stack: Node.js, Express 5, MongoDB Atlas + Mongoose, JWT (access/refresh), React + Vite + Tailwind.
Architecture: feature-based folders (vehicles/, drivers/, trips/, maintenance/, fuel/, expenses/, auth/).

Rules:
- Always add `return` before res.json/res.render in error branches — never let execution continue after sending a response.
- Never leave a catch block without a fallback response to the client.
- All status transitions (Vehicle/Driver/Trip/Maintenance) MUST go through services/businessRules.js — no inline status checks in controllers.
- Registration numbers and emails are unique — enforce at schema level AND check before insert for clean error messages.
- RBAC: check role via middleware (checkRole(...roles)) on every protected route, never trust frontend-only restriction.
- Reports/dashboard use MongoDB aggregation ($group, $lookup) — no manual JS loops over full collections.