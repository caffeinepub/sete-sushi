import Map "mo:core/Map";
import Text "mo:core/Text";

module {
  // Old types - without phone and email in Settings
  type OldSettings = {
    brandName : Text;
    pickupAddress : Text;
    workHoursText : Text;
    deliveryNote : Text;
    minOrderCents : Nat;
    currencySymbol : Text;
  };

  type OldOffer = {
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

  type OldOrder = {
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

  type OldAdminSession = {
    token : Text;
    expiresAt : Int;
  };

  type OldActor = {
    adminPassword : Text;
    idCounter : Nat;
    settings : OldSettings;
    offers : Map.Map<Text, OldOffer>;
    orders : Map.Map<Text, OldOrder>;
    sessions : Map.Map<Text, OldAdminSession>;
  };

  // New types - with phone and email in Settings
  type NewSettings = {
    brandName : Text;
    pickupAddress : Text;
    workHoursText : Text;
    deliveryNote : Text;
    minOrderCents : Nat;
    currencySymbol : Text;
    phone : Text;
    email : Text;
  };

  type NewOffer = {
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

  type NewOrder = {
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

  type NewAdminSession = {
    token : Text;
    expiresAt : Int;
  };

  type NewActor = {
    adminPassword : Text;
    idCounter : Nat;
    settings : NewSettings;
    offers : Map.Map<Text, NewOffer>;
    orders : Map.Map<Text, NewOrder>;
    sessions : Map.Map<Text, NewAdminSession>;
  };

  public func run(old : OldActor) : NewActor {
    let newSettings : NewSettings = {
      old.settings with
      phone = "+371 XXXXXXXX";
      email = "sete.latvia@gmail.com";
    };

    let newOffers = old.offers.map<Text, OldOffer, NewOffer>(
      func(_id, oldOffer) { oldOffer },
    );

    let newOrders = old.orders.map<Text, OldOrder, NewOrder>(
      func(_id, oldOrder) { oldOrder },
    );

    let newSessions = old.sessions.map<Text, OldAdminSession, NewAdminSession>(
      func(_token, oldSession) { oldSession },
    );

    {
      adminPassword = old.adminPassword;
      idCounter = old.idCounter;
      settings = newSettings;
      offers = newOffers;
      orders = newOrders;
      sessions = newSessions;
    };
  };
};
