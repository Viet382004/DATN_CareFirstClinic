using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CareFirstClinic.API.Migrations
{
    /// <inheritdoc />
    public partial class addtimeslotTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Schedules_ScheduleId",
                table: "Appointments");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_ScheduleId",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "AppointmentDate",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "Appointments");

            migrationBuilder.RenameColumn(
                name: "ScheduleId",
                table: "Appointments",
                newName: "TimeSlotId");

            migrationBuilder.CreateTable(
                name: "TimeSlots",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScheduleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    EndTime = table.Column<TimeSpan>(type: "time", nullable: false),
                    IsBooked = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimeSlots", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TimeSlots_Schedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "Schedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_TimeSlotId",
                table: "Appointments",
                column: "TimeSlotId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TimeSlots_ScheduleId",
                table: "TimeSlots",
                column: "ScheduleId");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_TimeSlots_TimeSlotId",
                table: "Appointments",
                column: "TimeSlotId",
                principalTable: "TimeSlots",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_TimeSlots_TimeSlotId",
                table: "Appointments");

            migrationBuilder.DropTable(
                name: "TimeSlots");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_TimeSlotId",
                table: "Appointments");

            migrationBuilder.RenameColumn(
                name: "TimeSlotId",
                table: "Appointments",
                newName: "ScheduleId");

            migrationBuilder.AddColumn<DateTime>(
                name: "AppointmentDate",
                table: "Appointments",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "EndTime",
                table: "Appointments",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "StartTime",
                table: "Appointments",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0));

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_ScheduleId",
                table: "Appointments",
                column: "ScheduleId");

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Schedules_ScheduleId",
                table: "Appointments",
                column: "ScheduleId",
                principalTable: "Schedules",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
