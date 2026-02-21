import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: string;
        email: string;
        nom: string;
        prenom: string;
        role: string;
        telephone: string | null;
        actif: boolean;
        dateCreation: string;
        derniereConnexion: string | null;
    }[]>;
    create(dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        nom: string;
        prenom: string;
        role: string;
        telephone: string | null;
        actif: boolean;
        dateCreation: string;
        derniereConnexion: string | null;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        nom: string;
        prenom: string;
        role: string;
        telephone: string | null;
        actif: boolean;
        dateCreation: string;
        derniereConnexion: string | null;
    }>;
}
