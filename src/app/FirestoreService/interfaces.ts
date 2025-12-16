// User Profile Interface
export interface User {
  uid: string;
  email: string;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
}

// Bus Stop Interface
export interface BusStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  createdAt: Date;
}

// Bus Interface
export interface Bus {
  id: string;
  busNumber: string;
  routeName: string; // e.g., "Express A"
  stops: string[]; // Array of stop IDs in order
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Route Interface (Generated route between two points)
export interface Route {
  id: string;
  originStopId: string;
  destinationStopId: string;
  buses: string[]; // Array of bus IDs that serve this route
  estimatedDuration: number; // in minutes
  distance?: number; // in kilometers
  createdAt: Date;
}

// Favorite Route Interface (User's saved routes)
export interface FavoriteRoute {
  id: string;
  userId: string;
  originStopId: string;
  originStopName: string;
  destinationStopId: string;
  destinationStopName: string;
  buses: number[]; // Bus numbers
  busRoute?: string; // e.g., "Express A"
  createdAt: Date;
  isFavorite: boolean;
}

// Recent Search Interface
export interface RecentSearch {
  id: string;
  userId: string;
  originStopId: string;
  originStopName: string;
  destinationStopId: string;
  destinationStopName: string;
  searchedAt: Date;
}

// Search Query Interface (for user input)
export interface SearchQuery {
  origin: string;
  destination: string;
  userId?: string;
}

// Search Result Interface (returned to user)
export interface SearchResult {
  id: string;
  originStop: BusStop;
  destinationStop: BusStop;
  buses: BusRouteInfo[];
  estimatedDuration: number;
}

export interface BusRouteInfo {
  busId: string;
  busNumber: string;
  routeName?: string;
  stops: BusStopInfo[]
  isExpanded?: boolean;
  originStopId?: string;       
  destinationStopId?: string;  
}

// Bus Stop Information (with highlight status)
export interface BusStopInfo {
  stopId: string;
  name: string;
  isHighlighted: boolean; // true for origin and destination
}
// DTO (Data Transfer Object) for creating favorite routes
export interface CreateFavoriteRouteDTO {
  originStopId: string;
  originStopName: string;
  destinationStopId: string;
  destinationStopName: string;
  buses: number[];
  busRoute?: string;
}

// DTO for creating recent searches
export interface CreateRecentSearchDTO {
  originStopId: string;
  originStopName: string;
  destinationStopId: string;
  destinationStopName: string;
}

// DTO for updating user profile
export interface UpdateUserDTO {
  fullName?: string;
  email?: string;
}

