import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        nom: string;
        prenom: string;
        role: string;
        telephone: string | null;
        actif: boolean;
        dateCreation: string;
        derniereConnexion: string | null;
    } | null>;
    findById(id: string): Promise<{
        id: string;
        email: string;
        nom: string;
        prenom: string;
        role: string;
        telephone: string | null;
        actif: boolean;
        dateCreation: string;
        derniereConnexion: string | null;
    } | null>;
    updateDerniereConnexion(id: string): Promise<{
        id: string;
        email: string;
        passwordHash: string;
        nom: string;
        prenom: string;
        role: string;
        telephone: string | null;
        actif: boolean;
        dateCreation: string;
        derniereConnexion: string | null;
    }>;
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
