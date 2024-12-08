export interface DiscussionDTO {
  titre: string;
  description: string;
  membres: any[];
  createur: {
    id: number;
  };
}