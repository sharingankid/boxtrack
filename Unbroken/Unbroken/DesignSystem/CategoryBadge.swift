import SwiftUI

/// Small pill used to display a recipe category (e.g. "dessert", "main course").
struct CategoryBadge: View {
    let name: String

    var body: some View {
        Text(name.capitalized)
            .font(.brandCaption)
            .foregroundStyle(Color.brandPrimary)
            .padding(.horizontal, DesignSystem.Spacing.sm)
            .padding(.vertical, DesignSystem.Spacing.xs)
            .background(Color.brandPrimary.opacity(0.12))
            .clipShape(Capsule())
    }
}

#Preview {
    HStack {
        CategoryBadge(name: "dessert")
        CategoryBadge(name: "main course")
    }
    .padding()
    .background(Color.brandBackground)
}
