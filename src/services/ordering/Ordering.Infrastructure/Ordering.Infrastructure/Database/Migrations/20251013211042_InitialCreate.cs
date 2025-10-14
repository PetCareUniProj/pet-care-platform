using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Ordering.Infrastructure.Database.Migrations
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
                name: "buyers",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_buyers", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "card_type",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_card_type", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "IntegrationEventLog",
                schema: "public",
                columns: table => new
                {
                    event_id = table.Column<Guid>(type: "uuid", nullable: false),
                    event_type_name = table.Column<string>(type: "text", nullable: false),
                    state = table.Column<int>(type: "integer", nullable: false),
                    times_sent = table.Column<int>(type: "integer", nullable: false),
                    creation_time = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    transaction_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_integration_event_log", x => x.event_id);
                });

            migrationBuilder.CreateTable(
                name: "payment_method",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    card_type_id = table.Column<int>(type: "integer", nullable: false),
                    buyer_id = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_payment_method", x => x.id);
                    table.ForeignKey(
                        name: "fk_payment_method_buyers_buyer_id",
                        column: x => x.buyer_id,
                        principalSchema: "public",
                        principalTable: "buyers",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_payment_method_card_type_card_type_id",
                        column: x => x.card_type_id,
                        principalSchema: "public",
                        principalTable: "card_type",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "orders",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    order_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    buyer_id = table.Column<Guid>(type: "uuid", nullable: true),
                    order_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_recurring = table.Column<bool>(type: "boolean", nullable: false),
                    recurrence_interval = table.Column<TimeSpan>(type: "interval", nullable: true),
                    next_recurrence_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    parent_order_id = table.Column<int>(type: "integer", nullable: true),
                    PaymentMethodId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_orders", x => x.id);
                    table.ForeignKey(
                        name: "fk_orders_buyers_buyer_id",
                        column: x => x.buyer_id,
                        principalSchema: "public",
                        principalTable: "buyers",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_orders_payment_method_payment_method_id",
                        column: x => x.PaymentMethodId,
                        principalSchema: "public",
                        principalTable: "payment_method",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "order_item",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    product_name = table.Column<string>(type: "text", nullable: false),
                    picture_url = table.Column<string>(type: "text", nullable: false),
                    unit_price = table.Column<decimal>(type: "numeric", nullable: false),
                    discount = table.Column<decimal>(type: "numeric", nullable: false),
                    units = table.Column<int>(type: "integer", nullable: false),
                    product_id = table.Column<int>(type: "integer", nullable: false),
                    order_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_order_item", x => x.id);
                    table.ForeignKey(
                        name: "fk_order_item_orders_order_id",
                        column: x => x.order_id,
                        principalSchema: "public",
                        principalTable: "orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_order_item_order_id",
                schema: "public",
                table: "order_item",
                column: "order_id");

            migrationBuilder.CreateIndex(
                name: "ix_orders_buyer_id",
                schema: "public",
                table: "orders",
                column: "buyer_id");

            migrationBuilder.CreateIndex(
                name: "ix_orders_payment_method_id",
                schema: "public",
                table: "orders",
                column: "PaymentMethodId");

            migrationBuilder.CreateIndex(
                name: "ix_payment_method_buyer_id",
                schema: "public",
                table: "payment_method",
                column: "buyer_id");

            migrationBuilder.CreateIndex(
                name: "ix_payment_method_card_type_id",
                schema: "public",
                table: "payment_method",
                column: "card_type_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IntegrationEventLog",
                schema: "public");

            migrationBuilder.DropTable(
                name: "order_item",
                schema: "public");

            migrationBuilder.DropTable(
                name: "orders",
                schema: "public");

            migrationBuilder.DropTable(
                name: "payment_method",
                schema: "public");

            migrationBuilder.DropTable(
                name: "buyers",
                schema: "public");

            migrationBuilder.DropTable(
                name: "card_type",
                schema: "public");
        }
    }
}
