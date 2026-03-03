import Map "mo:core/Map";
import Text "mo:core/Text";

module {
  type Offer = {
    id : Text;
    name : Text;
    pieces : Nat;
    priceCents : Nat;
    description : Text;
    imageId : ?Text;
    imageUrl : ?Text;
    isActive : Bool;
    isFeatured : Bool;
    sortOrder : Int;
    createdAt : Int;
    updatedAt : Int;
  };

  type Order = {
    id : Text;
    createdAt : Int;
    statusText : Text;
    offerId : Text;
    offerName : Text;
    offerPieces : Nat;
    offerPriceCents : Nat;
    customerPhone : Text;
    customerName : Text;
    deliveryTypeText : Text;
    address : Text;
    desiredTime : Text;
    notes : Text;
    pickupAddress : Text;
  };

  type Settings = {
    brandName : Text;
    pickupAddress : Text;
    workHoursText : Text;
    deliveryNote : Text;
    minOrderCents : Nat;
    currencySymbol : Text;
  };

  type AdminSession = {
    token : Text;
    expiresAt : Int;
  };

  type OldActor = {
    offers : Map.Map<Text, Offer>;
    orders : Map.Map<Text, Order>;
    sessions : Map.Map<Text, AdminSession>;
    settings : Settings;
    adminPassword : Text;
    idCounter : Nat;
  };

  type NewActor = {
    offers : Map.Map<Text, Offer>;
    orders : Map.Map<Text, Order>;
    sessions : Map.Map<Text, AdminSession>;
    settings : Settings;
    adminPassword : Text;
    idCounter : Nat;
  };

  public func run(old : OldActor) : NewActor {
    { old with adminPassword = "admin123"; sessions = Map.empty<Text, AdminSession>() };
  };
};
