import SwiftUI

/// Branded call-to-action button — solid brand-green fill, white label.
struct PrimaryButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.brandHeadline())
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, DesignSystem.Spacing.sm)
        }
        .background(Color.brandPrimary)
        .clipShape(RoundedRectangle(cornerRadius: DesignSystem.CornerRadius.button, style: .continuous))
    }
}

#Preview {
    PrimaryButton(title: "Rechercher") {}
        .padding()
        .background(Color.brandBackground)
}
