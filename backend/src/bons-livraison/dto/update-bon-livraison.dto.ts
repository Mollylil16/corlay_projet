import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateBonLivraisonDto {
  @IsOptional()
  @IsString()
  statut?: string;

  @IsOptional()
  @IsString()
  dateLivraison?: string;

  @IsOptional()
  @IsString()
  heureArrivee?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantiteLivree?: number;

  @IsOptional()
  @IsBoolean()
  signature?: boolean;

  @IsOptional()
  @IsString()
  observations?: string;

  /** Ordre de passage dans l'itinéraire (1 = 1ère livraison). */
  @IsOptional()
  @IsInt()
  @Min(1)
  ordrePassage?: number;

  /** Durée du trajet pour atteindre ce point depuis le précédent (minutes). */
  @IsOptional()
  @IsInt()
  @Min(0)
  dureeTrajetMinutes?: number;

  /** Durée du déchargement sur place (minutes) — prise en compte pour l'ETA du client suivant. */
  @IsOptional()
  @IsInt()
  @Min(0)
  dureeDechargementMinutes?: number;

  /** Heure d'arrivée prévue (HH:mm) — peut être calculée automatiquement. */
  @IsOptional()
  @IsString()
  heureArriveePrevue?: string;
}
