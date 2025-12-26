export interface User {
  uid: string;
  email: string;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface BusStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  createdAt: Date;
}

export interface Bus {
  id: string;
  busNumber: string;
  routeName: string; 
  stops: string[]; 
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Route {
  id: string;
  originStopId: string;
  destinationStopId: string;
  buses: string[]; 
  createdAt: Date;
}

export interface FavoriteRoute {
  id: string;
  userId: string;
  originStopId: string;
  originStopName: string;
  destinationStopId: string;
  destinationStopName: string;
  buses: string[]; 
  busRoute?: string; 
  createdAt: Date;
  isFavorite: boolean;
}

export interface RecentSearch {
  id: string;
  userId: string;
  originStopId: string;
  originStopName: string;
  destinationStopId: string;
  destinationStopName: string;
  searchedAt: Date;
}


export interface SearchResult {
  id: string;
  originStopId: string;
  originStopName: string;
  destinationStopId: string;
  destinationStopName: string;
  searchedAt: Date;
  userId: string;
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

export interface BusStopInfo {
  stopId: string;
  name: string;
  isHighlighted: boolean;
}


export interface CreateRecentSearchDTO {
  originStopId: string;
  originStopName: string;
  destinationStopId: string;
  destinationStopName: string;
}

export interface UpdateUserDTO {
  fullName: string;
  email: string;
  phone?: string;
  address?: string; 
}

