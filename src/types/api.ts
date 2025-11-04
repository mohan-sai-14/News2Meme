export interface Article {
  title: string;
  description: string;
  source: {
    name: string;
    url: string;
  };
  url: string;
  urlToImage: string;
  publishedAt: string;
}

export interface NewsApiResponse {
  articles: Article[];
  totalResults: number;
  status?: string;
  code?: string;
  message?: string;
}
