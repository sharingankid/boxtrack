import CoreGraphics

/// Shared design tokens. Keep raw values here instead of scattering magic
/// numbers across views.
enum DesignSystem {
    enum Spacing {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
    }

    enum CornerRadius {
        static let button: CGFloat = 12
        static let card: CGFloat = 16
    }
}
