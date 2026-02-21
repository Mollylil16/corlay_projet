import { CreateTankDto } from './create-tank.dto';
export declare class CreateDepotDto {
    nom: string;
    statut?: string;
    tanks?: CreateTankDto[];
}
