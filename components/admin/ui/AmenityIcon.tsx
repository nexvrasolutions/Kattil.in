import {
  BedDouble, LockKeyhole, Wifi, Coffee, SquareParking, WashingMachine,
  PawPrint, ChefHat, Plane, Sparkles, Dumbbell, Waves, Wind,
  Bath, Shield, Clock, MapPin, Car, UtensilsCrossed, Star,
  MonitorSmartphone, Music, Camera, Gift, Zap, Heart, Sun,
  Fan, LampDesk, ConciergeBell, BellRing, Trees, Building2, Tv, Sofa,
  type LucideIcon,
} from "lucide-react";
import { DEFAULT_AMENITY_ICON } from "@/lib/amenities";

// Maps the icon string stored on an Amenity to its Lucide component.
export const AMENITY_ICONS: Record<string, LucideIcon> = {
  BedDouble, LockKeyhole, Wifi, Coffee, SquareParking, WashingMachine,
  PawPrint, ChefHat, Plane, Sparkles, Dumbbell, Waves, Wind,
  Bath, Shield, Clock, MapPin, Car, UtensilsCrossed, Star,
  MonitorSmartphone, Music, Camera, Gift, Zap, Heart, Sun,
  Fan, LampDesk, ConciergeBell, BellRing, Trees, Building2, Tv, Sofa,
};

export const AMENITY_ICON_OPTIONS = Object.keys(AMENITY_ICONS);

export function AmenityIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && AMENITY_ICONS[name]) || AMENITY_ICONS[DEFAULT_AMENITY_ICON];
  return <Icon className={className} />;
}
