using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ELITC_AI_Chatbot.Models.Migrations
{
    /// <inheritdoc />
    public partial class AddNameField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF NOT EXISTS(SELECT 1 FROM sys.columns WHERE Name = N'Name' AND Object_ID = Object_ID(N'AspNetUsers'))
                BEGIN
                    ALTER TABLE [AspNetUsers] ADD [Name] nvarchar(max) NOT NULL DEFAULT N'';
                END");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Name",
                table: "AspNetUsers");
        }
    }
}
