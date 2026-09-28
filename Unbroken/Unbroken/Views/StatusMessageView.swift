import SwiftUI

/// Shared empty/error state layout for list screens.
struct StatusMessageView<Action: View>: View {
    let title: String
    let message: String
    let systemImage: String
    @ViewBuilder var action: () -> Action

    init(
        title: String,
        message: String,
        systemImage: String,
        @ViewBuilder action: @escaping () -> Action = { EmptyView() }
    ) {
        self.title = title
        self.message = message
        self.systemImage = systemImage
        self.action = action
    }

    var body: some View {
        VStack(spacing: DesignSystem.Spacing.md) {
            Image(systemName: systemImage)
                .font(.system(size: 40))
                .foregroundStyle(Color.brandPrimary)
            Text(title)
                .font(.brandHeadline())
                .foregroundStyle(Color.brandText)
            Text(message)
                .font(.brandBody)
                .foregroundStyle(Color.brandText.opacity(0.7))
                .multilineTextAlignment(.center)
            action()
        }
        .padding(DesignSystem.Spacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

#Preview {
    StatusMessageView(
        title: "No recipes found",
        message: "Try a different search term.",
        systemImage: "fork.knife"
    )
    .background(Color.brandBackground)
}
