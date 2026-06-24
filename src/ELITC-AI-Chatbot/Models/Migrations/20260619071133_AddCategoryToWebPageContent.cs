using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ELITC_AI_Chatbot.Models.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryToWebPageContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "WebPages",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "WebPages");
        }
    }
}
