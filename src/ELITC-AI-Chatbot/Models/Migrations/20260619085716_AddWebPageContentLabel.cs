using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ELITC_AI_Chatbot.Models.Migrations
{
    /// <inheritdoc />
    public partial class AddWebPageContentLabel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Category",
                table: "WebPages",
                newName: "Label");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Label",
                table: "WebPages",
                newName: "Category");
        }
    }
}
