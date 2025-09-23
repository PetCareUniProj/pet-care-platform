using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Catalog.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.CreateTable(
                name: "brands",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_brands", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "categories",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_categories", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "items",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    slug = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    price = table.Column<decimal>(type: "numeric", nullable: false),
                    picture_file_name = table.Column<string>(type: "text", nullable: true),
                    catalog_brand_id = table.Column<int>(type: "integer", nullable: false),
                    available_stock = table.Column<int>(type: "integer", nullable: false),
                    restock_threshold = table.Column<int>(type: "integer", nullable: false),
                    max_stock_threshold = table.Column<int>(type: "integer", nullable: false),
                    on_reorder = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_items_brands_catalog_brand_id",
                        column: x => x.catalog_brand_id,
                        principalSchema: "public",
                        principalTable: "brands",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "catalog_item_categories",
                schema: "public",
                columns: table => new
                {
                    item_id = table.Column<int>(type: "integer", nullable: false),
                    category_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_catalog_item_categories", x => new { x.item_id, x.category_id });
                    table.ForeignKey(
                        name: "fk_catalog_item_categories_categories_category_id",
                        column: x => x.category_id,
                        principalSchema: "public",
                        principalTable: "categories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_catalog_item_categories_items_item_id",
                        column: x => x.item_id,
                        principalSchema: "public",
                        principalTable: "items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_brands_name",
                schema: "public",
                table: "brands",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_catalog_item_categories_category_id",
                schema: "public",
                table: "catalog_item_categories",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "ix_categories_name",
                schema: "public",
                table: "categories",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_items_catalog_brand_id",
                schema: "public",
                table: "items",
                column: "catalog_brand_id");

            migrationBuilder.CreateIndex(
                name: "ix_items_slug",
                schema: "public",
                table: "items",
                column: "slug",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "catalog_item_categories",
                schema: "public");

            migrationBuilder.DropTable(
                name: "categories",
                schema: "public");

            migrationBuilder.DropTable(
                name: "items",
                schema: "public");

            migrationBuilder.DropTable(
                name: "brands",
                schema: "public");
        }
    }
}
