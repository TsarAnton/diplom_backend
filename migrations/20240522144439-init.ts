import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class init1630931718191 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'user',
				columns: [
					{
						name: 'id',
						type: 'serial',
						isPrimary: true,
					},
					{
						name: 'login',
						type: 'text',
						isNullable: false,
					},
					{
						name: 'password',
						type: 'text',
						isNullable: false,
					},
                    {
						name: 'deleted_date',
						type: 'timestamp',
						isNullable: true,
					},
				],
				engine: 'InnoDB',
			}),
		);

		await queryRunner.createTable(
			new Table({
				name: 'role',
				columns: [
					{
						name: 'id',
						type: 'serial',
						isPrimary: true,
					},
					{
						name: 'name',
						type: 'text',
						isNullable: false,
					},
					{
						name: 'deleted_date',
						type: 'timestamp',
						isNullable: true,
					},
				],
				engine: 'InnoDB',
			}),
		);

        await queryRunner.createTable(
			new Table({
				name: 'computer',
				columns: [
					{
						name: 'id',
						type: 'serial',
						isPrimary: true,
					},
					{
						name: 'name',
						type: 'text',
						isNullable: false,
					},
                    {
						name: 'macAddress',
						type: 'text',
						isNullable: false,
					},
                    {
						name: 'ipAddress',
						type: 'text',
						isNullable: false,
					},
                    {
						name: 'audince',
						type: 'text',
						isNullable: false,
					},
					{
						name: 'deleted_date',
						type: 'timestamp',
						isNullable: true,
					},
				],
				engine: 'InnoDB',
			}),
		);

        await queryRunner.createTable(
			new Table({
				name: 'day_computer_work',
				columns: [
					{
						name: 'id',
						type: 'serial',
						isPrimary: true,
					},
					{
						name: 'date',
						type: 'timestamp',
						isNullable: false,
					},
                    {
						name: 'computer_id',
						type: 'int',
						isNullable: false,
					},
                    {
						name: 'hours',
						type: 'real',
						isNullable: false,
					},
                    {
						name: 'operatingSystem',
						type: 'text',
						isNullable: true,
					},
					{
						name: 'deleted_date',
						type: 'timestamp',
						isNullable: true,
					},
				],
				engine: 'InnoDB',
			}),
		);

        await queryRunner.createTable(
			new Table({
				name: 'month_computer_work',
				columns: [
					{
						name: 'id',
						type: 'serial',
						isPrimary: true,
					},
					{
						name: 'date',
						type: 'timestamp',
						isNullable: false,
					},
                    {
						name: 'computer_id',
						type: 'int',
						isNullable: false,
					},
                    {
						name: 'hours',
						type: 'real',
						isNullable: false,
					},
                    {
						name: 'operatingSystem',
						type: 'text',
						isNullable: true,
					},
					{
						name: 'deleted_date',
						type: 'timestamp',
						isNullable: true,
					},
				],
				engine: 'InnoDB',
			}),
		);

        await queryRunner.createTable(
			new Table({
				name: 'year_computer_work',
				columns: [
					{
						name: 'id',
						type: 'serial',
						isPrimary: true,
					},
					{
						name: 'date',
						type: 'timestamp',
						isNullable: false,
					},
                    {
						name: 'computer_id',
						type: 'int',
						isNullable: false,
					},
                    {
						name: 'hours',
						type: 'real',
						isNullable: false,
					},
                    {
						name: 'operatingSystem',
						type: 'text',
						isNullable: true,
					},
					{
						name: 'deleted_date',
						type: 'timestamp',
						isNullable: true,
					},
				],
				engine: 'InnoDB',
			}),
		);

        await queryRunner.createTable(
			new Table({
				name: 'log_windows',
				columns: [
					{
						name: 'id',
						type: 'serial',
						isPrimary: true,
					},
					{
						name: 'computer_id',
						type: 'int',
						isNullable: false,
					},
                    {
						name: 'type',
						type: 'boolean',
						isNullable: false,
					},
                    {
						name: 'login_id',
						type: 'text',
						isNullable: true,
					},
                    {
						name: 'operating_systen',
						type: 'text',
						isNullable: true,
					},
                    {
						name: 'date',
						type: 'timestamp',
						isNullable: false,
					},
					{
						name: 'deleted_date',
						type: 'timestamp',
						isNullable: true,
					},
				],
				engine: 'InnoDB',
			}),
		);

        await queryRunner.createTable(
			new Table({
				name: 'user_role',
				columns: [
					{
						name: 'id',
						type: 'serial',
						isPrimary: true,
					},
					{
						name: 'user_id',
						type: 'int',
						isNullable: false,
					},
                    {
						name: 'role_id',
						type: 'int',
						isNullable: false,
					},
					{
						name: 'deleted_date',
						type: 'timestamp',
						isNullable: true,
					},
				],
				engine: 'InnoDB',
			}),
		);

        await queryRunner.createTable(
			new Table({
				name: 'period_computer_work',
				columns: [
					{
						name: 'id',
						type: 'serial',
						isPrimary: true,
					},
					{
						name: 'computer_id',
						type: 'int',
						isNullable: false,
					},
                    {
						name: 'date_start',
						type: 'timestamp',
						isNullable: false,
					},
                    {
						name: 'date_end',
						type: 'timestamp',
						isNullable: false,
					},
                    {
						name: 'login_id',
						type: 'text',
						isNullable: false,
					},
                    {
						name: 'operatingSystem',
						type: 'text',
						isNullable: true,
					},
					{
						name: 'deleted_date',
						type: 'timestamp',
						isNullable: true,
					},
				],
				engine: 'InnoDB',
			}),
		);

		await queryRunner.createForeignKey(
			'user_role',
			new TableForeignKey({
				name: 'fk_user_role_to_role',
				columnNames: ['role_id'],
				referencedColumnNames: ['id'],
				referencedTableName: 'roles',
				onDelete: 'RESTRICT',
				onUpdate: 'RESTRICT',
			}),
		);

		await queryRunner.createForeignKey(
			'user_role',
			new TableForeignKey({
				name: 'fk_user_role_to_user',
				columnNames: ['user_id'],
				referencedColumnNames: ['id'],
				referencedTableName: 'user',
				onDelete: 'RESTRICT',
				onUpdate: 'RESTRICT',
			}),
		);

		await queryRunner.createForeignKey(
			'day_computer_work',
			new TableForeignKey({
				name: 'fk_day_computer_work_to_computers',
				columnNames: ['computer_id'],
				referencedColumnNames: ['id'],
				referencedTableName: 'computer',
				onDelete: 'RESTRICT',
				onUpdate: 'RESTRICT',
			}),
		);

        await queryRunner.createForeignKey(
			'month_computer_work',
			new TableForeignKey({
				name: 'fk_month_computer_work_to_computers',
				columnNames: ['computer_id'],
				referencedColumnNames: ['id'],
				referencedTableName: 'computer',
				onDelete: 'RESTRICT',
				onUpdate: 'RESTRICT',
			}),
		);

        await queryRunner.createForeignKey(
			'year_computer_work',
			new TableForeignKey({
				name: 'fk_year_computer_work_to_computers',
				columnNames: ['computer_id'],
				referencedColumnNames: ['id'],
				referencedTableName: 'computer',
				onDelete: 'RESTRICT',
				onUpdate: 'RESTRICT',
			}),
		);

        await queryRunner.createForeignKey(
			'period_computer_work',
			new TableForeignKey({
				name: 'fk_period_computer_work_to_computers',
				columnNames: ['computer_id'],
				referencedColumnNames: ['id'],
				referencedTableName: 'computer',
				onDelete: 'RESTRICT',
				onUpdate: 'RESTRICT',
			}),
		);

        await queryRunner.createForeignKey(
			'log_windows',
			new TableForeignKey({
				name: 'fk_log_windows_to_computers',
				columnNames: ['computer_id'],
				referencedColumnNames: ['id'],
				referencedTableName: 'computer',
				onDelete: 'RESTRICT',
				onUpdate: 'RESTRICT',
			}),
		);
    }

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropTable('day_computer_work');
		await queryRunner.dropTable('month_computer_work');
		await queryRunner.dropTable('year_computer_work');
		await queryRunner.dropTable('period_computer_work');
		await queryRunner.dropTable('log_windows');
		await queryRunner.dropTable('computer');
		await queryRunner.dropTable('user_role');
		await queryRunner.dropTable('user');
		await queryRunner.dropTable('role');
	}
}
