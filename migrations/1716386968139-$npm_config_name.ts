import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1716386968139 implements MigrationInterface {
    name = ' $npmConfigName1716386968139'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "log_windows" ("id" SERIAL NOT NULL, "type" boolean NOT NULL, "date" TIMESTAMP NOT NULL, "login_id" character varying(15) NOT NULL, "operating_system" character varying(50) NOT NULL, "deleted_date" TIMESTAMP, "computer_id" integer, CONSTRAINT "PK_21715c86ee3f24604e88e3183a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "day_computer_work" ("id" SERIAL NOT NULL, "date" TIMESTAMP NOT NULL, "hours" numeric NOT NULL, "operatingSystem" character varying NOT NULL, "deleted_date" TIMESTAMP, "computer_id" integer, CONSTRAINT "PK_95270ed89b73407fae52d8f0485" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "month_computer_work" ("id" SERIAL NOT NULL, "date" TIMESTAMP NOT NULL, "hours" numeric NOT NULL, "operatingSystem" character varying NOT NULL, "deleted_date" TIMESTAMP, "computer_id" integer, CONSTRAINT "PK_086daffae963c0ed84996886cf7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "period_computer_work" ("id" SERIAL NOT NULL, "dateStart" TIMESTAMP NOT NULL, "dateEnd" TIMESTAMP NOT NULL, "operatingSystem" character varying NOT NULL, "loginId" character varying NOT NULL, "deleted_date" TIMESTAMP, "computer_id" integer, CONSTRAINT "PK_79d21f2b4f9d427d8c73ff50776" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "computer" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "macAddress" character varying(12) NOT NULL, "ipAddress" character varying(15) NOT NULL, "audince" character varying(20) NOT NULL, "deleted_date" TIMESTAMP, CONSTRAINT "UQ_00f65c9fb51bd6ca58b3c76ef5c" UNIQUE ("macAddress"), CONSTRAINT "PK_775250089fb372f5edcfa2e5f95" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "year_computer_work" ("id" SERIAL NOT NULL, "date" TIMESTAMP NOT NULL, "hours" numeric NOT NULL, "operatingSystem" character varying NOT NULL, "deleted_date" TIMESTAMP, "computer_id" integer, CONSTRAINT "PK_209b99e058d086b9f28606881d2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "deleted_date" TIMESTAMP, CONSTRAINT "UQ_ae4578dcaed5adff96595e61660" UNIQUE ("name"), CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "login" character varying(100) NOT NULL, "password" character varying(100) NOT NULL, "deleted_date" TIMESTAMP, CONSTRAINT "UQ_a62473490b3e4578fd683235c5e" UNIQUE ("login"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_role" ("id" SERIAL NOT NULL, "deleted_date" TIMESTAMP, "role_id" integer, "user_id" integer, CONSTRAINT "PK_fb2e442d14add3cefbdf33c4561" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "log_windows" ADD CONSTRAINT "FK_de5801b708e0eb78433cab7b3a3" FOREIGN KEY ("computer_id") REFERENCES "computer"("id") ON DELETE RESTRICT ON UPDATE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "day_computer_work" ADD CONSTRAINT "FK_3da308ed7b2567ebd71644f7da6" FOREIGN KEY ("computer_id") REFERENCES "computer"("id") ON DELETE RESTRICT ON UPDATE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "month_computer_work" ADD CONSTRAINT "FK_84f01250021aca696726cae9d3c" FOREIGN KEY ("computer_id") REFERENCES "computer"("id") ON DELETE RESTRICT ON UPDATE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "period_computer_work" ADD CONSTRAINT "FK_45cf430f9579e62c284ca2037a3" FOREIGN KEY ("computer_id") REFERENCES "computer"("id") ON DELETE RESTRICT ON UPDATE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "year_computer_work" ADD CONSTRAINT "FK_7931a8dfaca35f9e7fa6b86cca5" FOREIGN KEY ("computer_id") REFERENCES "computer"("id") ON DELETE RESTRICT ON UPDATE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_32a6fc2fcb019d8e3a8ace0f55f" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "user_role" ADD CONSTRAINT "FK_d0e5815877f7395a198a4cb0a46" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE RESTRICT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_d0e5815877f7395a198a4cb0a46"`);
        await queryRunner.query(`ALTER TABLE "user_role" DROP CONSTRAINT "FK_32a6fc2fcb019d8e3a8ace0f55f"`);
        await queryRunner.query(`ALTER TABLE "year_computer_work" DROP CONSTRAINT "FK_7931a8dfaca35f9e7fa6b86cca5"`);
        await queryRunner.query(`ALTER TABLE "period_computer_work" DROP CONSTRAINT "FK_45cf430f9579e62c284ca2037a3"`);
        await queryRunner.query(`ALTER TABLE "month_computer_work" DROP CONSTRAINT "FK_84f01250021aca696726cae9d3c"`);
        await queryRunner.query(`ALTER TABLE "day_computer_work" DROP CONSTRAINT "FK_3da308ed7b2567ebd71644f7da6"`);
        await queryRunner.query(`ALTER TABLE "log_windows" DROP CONSTRAINT "FK_de5801b708e0eb78433cab7b3a3"`);
        await queryRunner.query(`DROP TABLE "user_role"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TABLE "year_computer_work"`);
        await queryRunner.query(`DROP TABLE "computer"`);
        await queryRunner.query(`DROP TABLE "period_computer_work"`);
        await queryRunner.query(`DROP TABLE "month_computer_work"`);
        await queryRunner.query(`DROP TABLE "day_computer_work"`);
        await queryRunner.query(`DROP TABLE "log_windows"`);
    }

}
