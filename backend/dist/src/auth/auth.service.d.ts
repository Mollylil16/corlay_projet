import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            nom: string;
            prenom: string;
            role: string;
            telephone: string | null;
            actif: true;
        };
    }>;
}
