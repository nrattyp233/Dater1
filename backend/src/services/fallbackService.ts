export interface DateIdea {
  title: string;
  description: string;
  locationType: string;
}

export interface LocalEvent {
  id: number;
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  imageUrl: string;
  source: string;
  price: string;
}

// Mock data generators
export const generateFallbackDateIdeas = (): DateIdea[] => [
  {
    title: "Coffee & Walk in the Park",
    description: "A casual coffee date followed by a relaxing walk in the nearby park. Perfect for getting to know each other in a low-pressure environment.",
    locationType: "Coffee shop & park"
  },
  {
    title: "Museum Adventure",
    description: "Explore the local museum together and discuss your favorite exhibits. Great for sparking interesting conversations!",
    locationType: "Museum"
  },
  {
    title: "Game Night",
    description: "A fun evening of board games and snacks. Choose from classic games or try something new!",
    locationType: "Cafe or home"
  }
];

export const getFallbackCity = (): string => "New York, NY";

export const getFallbackEvents = (): LocalEvent[] => [
  {
    id: 1,
    title: "Sunset Jazz in the Park",
    category: "Music",
    description: "Enjoy live jazz music as the sun sets in the park.",
    location: "Central Park Bandshell",
    date: "This Friday, 6:30 PM",
    imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
    source: "Local Events",
    price: "Free"
  }
];
