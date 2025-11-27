using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Subscription.Infrastructure.Database.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.CreateSequence(
                name: "paymentseq",
                schema: "public",
                incrementBy: 10);

            migrationBuilder.CreateSequence(
                name: "Subscriptionitemseq",
                schema: "public",
                incrementBy: 10);

            migrationBuilder.CreateSequence(
                name: "Subscriptionseq",
                schema: "public",
                incrementBy: 10);

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
                name: "card_types",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_card_types", x => x.id);
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
                name: "payments",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    CardTypeId = table.Column<int>(type: "integer", nullable: false),
                    buyer_id = table.Column<Guid>(type: "uuid", nullable: false),
                    Alias = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CardHolderName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CardNumber = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    Expiration = table.Column<DateTime>(type: "timestamp with time zone", maxLength: 25, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_payments", x => x.id);
                    table.ForeignKey(
                        name: "fk_payments_buyers_buyer_id",
                        column: x => x.buyer_id,
                        principalSchema: "public",
                        principalTable: "buyers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_payments_card_types_card_type_id",
                        column: x => x.CardTypeId,
                        principalSchema: "public",
                        principalTable: "card_types",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "subscriptions",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    subscription_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    address_street = table.Column<string>(type: "text", nullable: true),
                    address_city = table.Column<string>(type: "text", nullable: true),
                    address_state = table.Column<string>(type: "text", nullable: true),
                    address_country = table.Column<string>(type: "text", nullable: true),
                    address_zip_code = table.Column<string>(type: "text", nullable: true),
                    buyer_id = table.Column<Guid>(type: "uuid", nullable: true),
                    subscription_status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_recurring = table.Column<bool>(type: "boolean", nullable: false),
                    recurrence_interval = table.Column<TimeSpan>(type: "interval", nullable: true),
                    next_recurrence_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    parent_subscription_id = table.Column<int>(type: "integer", nullable: true),
                    PaymentMethodId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subscriptions", x => x.id);
                    table.ForeignKey(
                        name: "fk_subscriptions_buyers_buyer_id",
                        column: x => x.buyer_id,
                        principalSchema: "public",
                        principalTable: "buyers",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_subscriptions_payments_payment_method_id",
                        column: x => x.PaymentMethodId,
                        principalSchema: "public",
                        principalTable: "payments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "subscription_items",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false),
                    product_name = table.Column<string>(type: "text", nullable: false),
                    picture_url = table.Column<string>(type: "text", nullable: false),
                    unit_price = table.Column<decimal>(type: "numeric", nullable: false),
                    discount = table.Column<decimal>(type: "numeric", nullable: false),
                    units = table.Column<int>(type: "integer", nullable: false),
                    product_id = table.Column<int>(type: "integer", nullable: false),
                    subscription_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_subscription_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_subscription_items_subscriptions_subscription_id",
                        column: x => x.subscription_id,
                        principalSchema: "public",
                        principalTable: "subscriptions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_payments_buyer_id",
                schema: "public",
                table: "payments",
                column: "buyer_id");

            migrationBuilder.CreateIndex(
                name: "ix_payments_card_type_id",
                schema: "public",
                table: "payments",
                column: "CardTypeId");

            migrationBuilder.CreateIndex(
                name: "ix_subscription_items_subscription_id",
                schema: "public",
                table: "subscription_items",
                column: "subscription_id");

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_buyer_id",
                schema: "public",
                table: "subscriptions",
                column: "buyer_id");

            migrationBuilder.CreateIndex(
                name: "ix_subscriptions_payment_method_id",
                schema: "public",
                table: "subscriptions",
                column: "PaymentMethodId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IntegrationEventLog",
                schema: "public");

            migrationBuilder.DropTable(
                name: "subscription_items",
                schema: "public");

            migrationBuilder.DropTable(
                name: "subscriptions",
                schema: "public");

            migrationBuilder.DropTable(
                name: "payments",
                schema: "public");

            migrationBuilder.DropTable(
                name: "buyers",
                schema: "public");

            migrationBuilder.DropTable(
                name: "card_types",
                schema: "public");

            migrationBuilder.DropSequence(
                name: "paymentseq",
                schema: "public");

            migrationBuilder.DropSequence(
                name: "Subscriptionitemseq",
                schema: "public");

            migrationBuilder.DropSequence(
                name: "Subscriptionseq",
                schema: "public");
        }
    }
}
