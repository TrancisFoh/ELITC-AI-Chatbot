# Security Specification - ELITC Assistant

## Data Invariants
1. A course must always have a unique ID, title, and category.
2. Config keys are immutable.
3. Only verified admins can modify courses and configs.

## The "Dirty Dozen" Payloads (Blocked)
1. JSON with hidden `role: 'admin'` field in user profile.
2. Update `price` to a string instead of a number.
3. Creating a course without a `category`.
4. Deleting all courses from the client side without admin auth.
5. Injecting a massive string into a course `description`.
6. Self-assigning admin status in the `admins` collection.
7. Modifying `config` values from an unauthenticated session.
8. Listing the `admins` collection from a non-admin account.
9. Course ID with special characters like `/` or `..`.
10. Removing the `required` fields from a course document.
11. Updating `config` key field.
12. Creating a course with an existing ID but different data.

## Rules Logic
- `isSignedIn()`: Checks if `request.auth != null`.
- `isAdmin()`: Checks if the user's UID exists in the `/admins/` collection.
- `isValidCourse()`: Validates the shape and size of course data.
- `isValidConfig()`: Validates the shape of config data.

## Red Team Audit Results
- Identity Spoofing: Blocked by `isAdmin()` check verifying against the server-side `admins` collection.
- State Shortcutting: N/A (no complex state machines yet).
- Resource Poisoning: Blocked by `.size()` checks on all string fields.
- Email Spoofing: Rules verify `auth.token.email_verified == true`.
