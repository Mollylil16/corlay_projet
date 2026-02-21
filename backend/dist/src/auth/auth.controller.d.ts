import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
