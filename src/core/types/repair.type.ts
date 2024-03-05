import { Repair } from "../entities/repair.entity";

export class FrontenedRepair {
    public id: number;
    public discription: string;
    public endTime: Date;
    public begTime: Date;
    public user: {
        id: number;
        login: string;
    };
    public car: {
        id: number;
        mark: string;
        model: string;
    }

    constructor(repair: Repair) {
        this.id = repair.id;
        this.discription = repair.discription;
        this.endTime = repair.endTime;
        this.begTime = repair.begTime;
        this.user = repair.user ? {
            id: repair.user.id,
            login: repair.user.login,
        } :
        {
            id: -1,
            login: "unknown",
        }
        this.car = repair.car ? {
            id: repair.car.id,
            mark: repair.car.mark,
            model: repair.car.model,
        } : {
            id: -1,
            mark: "unknown",
            model: "unknown",
        }
    }
}