import SwiftUI

extension Font {
    /// Montserrat weights bundled via Info.plist's UIAppFonts. Falls back to the
    /// system font automatically if the named font isn't found in the bundle.
    private enum Montserrat: String {
        case regular = "Montserrat-Regular"
        case medium = "Montserrat-Medium"
        case semibold = "Montserrat-SemiBold"
        case bold = "Montserrat-Bold"
    }

    private static func montserrat(_ weight: Montserrat, size: CGFloat, relativeTo style: Font.TextStyle) -> Font {
        .custom(weight.rawValue, size: size, relativeTo: style)
    }

    /// Screen/section titles.
    static func brandTitle(size: CGFloat = 28) -> Font {
        montserrat(.bold, size: size, relativeTo: .title)
    }

    /// Card titles, emphasized labels.
    static func brandHeadline(size: CGFloat = 18) -> Font {
        montserrat(.semibold, size: size, relativeTo: .headline)
    }

    /// Body copy — system font (San Francisco), per the brand spec.
    static let brandBody = Font.system(size: 16)

    /// Secondary/meta text (calories, timestamps, badges).
    static let brandCaption = Font.system(size: 13)
}
