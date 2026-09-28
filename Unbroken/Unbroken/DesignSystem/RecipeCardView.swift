import SwiftUI

/// Presentational recipe card. Takes primitive view-data rather than the
/// `Recipe` domain model directly, so DesignSystem stays free of any
/// dependency on Models/Services — callers (Views/) do the mapping.
struct RecipeCardView: View {
    let name: String
    let calorieText: String
    let categories: [String]
    let imageURL: URL?

    var body: some View {
        HStack(alignment: .top, spacing: DesignSystem.Spacing.md) {
            AsyncImage(url: imageURL) { phase in
                switch phase {
                case .success(let image):
                    image.resizable().scaledToFill()
                case .failure, .empty:
                    Color.brandPrimary.opacity(0.15)
                @unknown default:
                    Color.brandPrimary.opacity(0.15)
                }
            }
            .frame(width: 72, height: 72)
            .clipShape(RoundedRectangle(cornerRadius: DesignSystem.CornerRadius.card - 4, style: .continuous))

            VStack(alignment: .leading, spacing: DesignSystem.Spacing.xs) {
                Text(name)
                    .font(.brandHeadline())
                    .foregroundStyle(Color.brandText)
                    .lineLimit(2)

                Text(calorieText)
                    .font(.brandCaption)
                    .foregroundStyle(Color.brandText.opacity(0.7))

                if !categories.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: DesignSystem.Spacing.xs) {
                            ForEach(categories, id: \.self) { category in
                                CategoryBadge(name: category)
                            }
                        }
                    }
                }
            }

            Spacer(minLength: 0)
        }
        .padding(DesignSystem.Spacing.md)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: DesignSystem.CornerRadius.card, style: .continuous))
        .shadow(color: .black.opacity(0.05), radius: 6, y: 2)
    }
}

#Preview {
    RecipeCardView(
        name: "Grilled Salmon Bowl",
        calorieText: "420 kcal",
        categories: ["main course", "dinner"],
        imageURL: nil
    )
    .padding()
    .background(Color.brandBackground)
}
