# Project Changelog

## [Unreleased]

### Major features

- Home dashboard with charts.
- Goals (must be time sensitive).
- Initial onboarding to add accounts.

## Minor features

- Modal inputs for prices should conform to the same input as moving funds.

### Bug

- When a user deletes a category, users must first reassign all transactions to another category.
- After adding a transaction, accounts must be properly updated without refreshing the page.
- When adding transactions to categories without sufficient assigned funds, it incorrectly handles decimal places (e.g. - £146.67000000000002).When deleted transaction, still does not retain correct decimal places.
- Balances in accounts should not be negative.
- Persistent modal error messages. Should reset after closing.

## [0.1.0] - Feb 2024 - Initial Release

### Added

- Home, Login, Signup Pages.
- Transaction Page.
- Accounts Page.
- Categories Page.

### Changed

- Initial beta test release.

### Deprecated

- Not applicable.

### Removed

- Not applicable.

### Fixed

- 0.1.0 released for beta testing.

### Security

- Not applicable.
