using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ELITC_AI_Chatbot.Models.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCourseSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Certification",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Courses");

            migrationBuilder.RenameColumn(
                name: "Topics",
                table: "Courses",
                newName: "Url");

            migrationBuilder.RenameColumn(
                name: "Skills",
                table: "Courses",
                newName: "TargetAudience");

            migrationBuilder.RenameColumn(
                name: "Roles",
                table: "Courses",
                newName: "Synopsis");

            migrationBuilder.RenameColumn(
                name: "Prerequisites",
                table: "Courses",
                newName: "Duration");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Url",
                table: "Courses",
                newName: "Topics");

            migrationBuilder.RenameColumn(
                name: "TargetAudience",
                table: "Courses",
                newName: "Skills");

            migrationBuilder.RenameColumn(
                name: "Synopsis",
                table: "Courses",
                newName: "Roles");

            migrationBuilder.RenameColumn(
                name: "Duration",
                table: "Courses",
                newName: "Prerequisites");

            migrationBuilder.AddColumn<string>(
                name: "Certification",
                table: "Courses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Courses",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
