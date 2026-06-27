import {
  Heart,
  ShoppingBag,
  User,
  Bell,
  Menu,
  X,
  type LucideProps,
} from "lucide-react";

export type IconProps = LucideProps;

export const WishlistIcon = (props: IconProps) => <Heart {...props} />;
export const CartIcon = (props: IconProps) => <ShoppingBag {...props} />;
export const ProfileIcon = (props: IconProps) => <User {...props} />;
export const NotificationIcon = (props: IconProps) => <Bell {...props} />;
export const MenuIcon = (props: IconProps) => <Menu {...props} />;
export const CloseIcon = (props: IconProps) => <X {...props} />;