import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
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

  module Offer {
    public func compareByFeaturedAndSortOrder(o1 : Offer, o2 : Offer) : Order.Order {
      switch (Bool.compare(o2.isFeatured, o1.isFeatured)) {
        case (#equal) { Int.compare(o1.sortOrder, o2.sortOrder) };
        case (order) { order };
      };
    };
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

  type SessionResponse = {
    ok : Bool;
    token : ?Text;
    error : ?Text;
  };

  type CreateOrderResponse = {
    ok : Bool;
    orderId : ?Text;
    error : ?Text;
  };

  type UploadImageResponse = {
    ok : Bool;
    imageId : ?Text;
    imageUrl : ?Text;
    error : ?Text;
  };

  type OffersListResponse = {
    ok : Bool;
    data : [Offer];
    error : ?Text;
  };

  type OrdersListResponse = {
    ok : Bool;
    data : [Order];
    error : ?Text;
  };

  var adminPassword = "sete_admin_123";

  let offers = Map.empty<Text, Offer>();
  let orders = Map.empty<Text, Order>();
  let sessions = Map.empty<Text, AdminSession>();

  var settings : Settings = {
    brandName = "SETE";
    pickupAddress = "Sete Noodles & Sushi, R. Prof. Francisco Link, 3512 - Capão da Imbuia, Curitiba - PR, 82810-350";
    workHoursText = "Seg a Sex, 18h - 22h";
    deliveryNote = "Entrega em até 30min da hora agendada";
    minOrderCents = 1000;
    currencySymbol = "R$";
  };

  var idCounter = 0;

  func generateId() : Text {
    idCounter += 1;
    Time.now().toText() # "_" # idCounter.toText();
  };

  include MixinStorage();

  // Public Queries
  public query ({ caller }) func getSettings() : async Settings {
    settings;
  };

  public query ({ caller }) func listOffersPublic() : async [Offer] {
    let activeOffers = offers.values().toArray().filter(
      func(o) { o.isActive }
    );
    activeOffers.sort(Offer.compareByFeaturedAndSortOrder);
  };

  public query ({ caller }) func getOfferById(id : Text) : async ?Offer {
    offers.get(id);
  };

  // Order Creation
  public shared ({ caller }) func createOrder(offerId : Text, customerPhone : Text, customerName : Text, deliveryType : Text, address : Text, desiredTime : Text, notes : Text) : async CreateOrderResponse {
    if (customerPhone.size() < 6) {
      return {
        ok = false;
        orderId = null;
        error = ?"Invalid phone number";
      };
    };

    if (deliveryType == "DELIVERY" and address.size() < 5) {
      return {
        ok = false;
        orderId = null;
        error = ?"Invalid address for delivery";
      };
    };

    switch (offers.get(offerId)) {
      case (null) {
        { ok = false; orderId = null; error = ?"Offer not found" };
      };
      case (?offer) {
        if (not offer.isActive) {
          return {
            ok = false;
            orderId = null;
            error = ?"Offer is not active";
          };
        };

        let orderId = generateId();
        let newOrder : Order = {
          id = orderId;
          createdAt = Time.now();
          statusText = "PENDING";
          offerId;
          offerName = offer.name;
          offerPieces = offer.pieces;
          offerPriceCents = offer.priceCents;
          customerPhone;
          customerName;
          deliveryTypeText = deliveryType;
          address;
          desiredTime;
          notes;
          pickupAddress = settings.pickupAddress;
        };

        orders.add(orderId, newOrder);
        {
          ok = true;
          orderId = ?orderId;
          error = null;
        };
      };
    };
  };

  // Admin Authentication
  public shared ({ caller }) func adminLogin(password : Text) : async SessionResponse {
    if (password != adminPassword) {
      return { ok = false; token = null; error = ?"Invalid password" };
    };

    let token = generateId();
    let session : AdminSession = {
      token;
      expiresAt = Time.now() + 24 * 60 * 60 * 1000_000_000;
    };
    sessions.add(token, session);
    {
      ok = true;
      token = ?token;
      error = null;
    };
  };

  public shared ({ caller }) func adminLogout(token : Text) : async { ok : Bool } {
    sessions.remove(token);
    { ok = true };
  };

  // Admin Offer Management
  public query ({ caller }) func adminListOffers(token : Text) : async OffersListResponse {
    validateSession(token);
    { ok = true; data = offers.values().toArray(); error = null };
  };

  public shared ({ caller }) func adminCreateOffer(token : Text, name : Text, pieces : Nat, priceCents : Nat, description : Text) : async {
    ok : Bool;
    id : ?Text;
    error : ?Text;
  } {
    validateSession(token);
    let id = generateId();
    let newOffer : Offer = {
      id;
      name;
      pieces;
      priceCents;
      description;
      imageId = null;
      imageUrl = null;
      isActive = false;
      isFeatured = false;
      sortOrder = 0;
      createdAt = Time.now();
      updatedAt = Time.now();
    };
    offers.add(id, newOffer);
    { ok = true; id = ?id; error = null };
  };

  public shared ({ caller }) func adminUpdateOffer(token : Text, id : Text, name : Text, pieces : Nat, priceCents : Nat, description : Text) : async { ok : Bool; error : ?Text } {
    validateSession(token);
    switch (offers.get(id)) {
      case (null) { Runtime.trap("Offer not found") };
      case (?offer) {
        let updatedOffer : Offer = {
          id;
          name;
          pieces;
          priceCents;
          description;
          imageId = offer.imageId;
          imageUrl = offer.imageUrl;
          isActive = offer.isActive;
          isFeatured = offer.isFeatured;
          sortOrder = offer.sortOrder;
          createdAt = offer.createdAt;
          updatedAt = Time.now();
        };
        offers.add(id, updatedOffer);
        { ok = true; error = null };
      };
    };
  };

  public shared ({ caller }) func adminDeleteOffer(token : Text, id : Text) : async { ok : Bool; error : ?Text } {
    validateSession(token);
    offers.remove(id);
    { ok = true; error = null };
  };

  public shared ({ caller }) func adminToggleActive(token : Text, id : Text, isActive : Bool) : async { ok : Bool; error : ?Text } {
    validateSession(token);
    switch (offers.get(id)) {
      case (null) { Runtime.trap("Offer not found") };
      case (?offer) {
        let updatedOffer : Offer = {
          id = offer.id;
          name = offer.name;
          pieces = offer.pieces;
          priceCents = offer.priceCents;
          description = offer.description;
          imageId = offer.imageId;
          imageUrl = offer.imageUrl;
          isActive;
          isFeatured = offer.isFeatured;
          sortOrder = offer.sortOrder;
          createdAt = offer.createdAt;
          updatedAt = Time.now();
        };
        offers.add(id, updatedOffer);
        { ok = true; error = null };
      };
    };
  };

  public shared ({ caller }) func adminSetFeatured(token : Text, id : Text, isFeatured : Bool) : async { ok : Bool; error : ?Text } {
    validateSession(token);
    switch (offers.get(id)) {
      case (null) { Runtime.trap("Offer not found") };
      case (?offer) {
        let updatedOffer : Offer = {
          id = offer.id;
          name = offer.name;
          pieces = offer.pieces;
          priceCents = offer.priceCents;
          description = offer.description;
          imageId = offer.imageId;
          imageUrl = offer.imageUrl;
          isActive = offer.isActive;
          isFeatured;
          sortOrder = offer.sortOrder;
          createdAt = offer.createdAt;
          updatedAt = Time.now();
        };
        offers.add(id, updatedOffer);
        { ok = true; error = null };
      };
    };
  };

  public shared ({ caller }) func adminSetSortOrder(token : Text, id : Text, sortOrder : Int) : async { ok : Bool; error : ?Text } {
    validateSession(token);
    switch (offers.get(id)) {
      case (null) { Runtime.trap("Offer not found") };
      case (?offer) {
        let updatedOffer : Offer = {
          id = offer.id;
          name = offer.name;
          pieces = offer.pieces;
          priceCents = offer.priceCents;
          description = offer.description;
          imageId = offer.imageId;
          imageUrl = offer.imageUrl;
          isActive = offer.isActive;
          isFeatured = offer.isFeatured;
          sortOrder;
          createdAt = offer.createdAt;
          updatedAt = Time.now();
        };
        offers.add(id, updatedOffer);
        { ok = true; error = null };
      };
    };
  };

  public shared ({ caller }) func adminUpdateOfferImage(token : Text, id : Text, imageId : Text, imageUrl : Text) : async { ok : Bool; error : ?Text } {
    validateSession(token);
    switch (offers.get(id)) {
      case (null) { Runtime.trap("Offer not found") };
      case (?offer) {
        let updatedOffer : Offer = {
          id = offer.id;
          name = offer.name;
          pieces = offer.pieces;
          priceCents = offer.priceCents;
          description = offer.description;
          imageId = ?imageId;
          imageUrl = ?imageUrl;
          isActive = offer.isActive;
          isFeatured = offer.isFeatured;
          sortOrder = offer.sortOrder;
          createdAt = offer.createdAt;
          updatedAt = Time.now();
        };
        offers.add(id, updatedOffer);
        { ok = true; error = null };
      };
    };
  };

  // Admin Order Management
  public query ({ caller }) func adminListOrders(token : Text, statusFilter : ?Text) : async OrdersListResponse {
    validateSession(token);
    let allOrders = orders.values().toArray();
    let filteredOrders = switch (statusFilter) {
      case (null) { allOrders };
      case (?status) {
        allOrders.filter(
          func(order) {
            Text.equal(order.statusText, status);
          }
        );
      };
    };
    { ok = true; data = filteredOrders; error = null };
  };

  public shared ({ caller }) func adminUpdateOrderStatus(token : Text, orderId : Text, newStatus : Text) : async { ok : Bool; error : ?Text } {
    validateSession(token);
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : Order = {
          id = order.id;
          createdAt = order.createdAt;
          statusText = newStatus;
          offerId = order.offerId;
          offerName = order.offerName;
          offerPieces = order.offerPieces;
          offerPriceCents = order.offerPriceCents;
          customerPhone = order.customerPhone;
          customerName = order.customerName;
          deliveryTypeText = order.deliveryTypeText;
          address = order.address;
          desiredTime = order.desiredTime;
          notes = order.notes;
          pickupAddress = order.pickupAddress;
        };
        orders.add(orderId, updatedOrder);
        { ok = true; error = null };
      };
    };
  };

  // Admin Settings Update
  public shared ({ caller }) func adminUpdateSettings(token : Text, brandName : Text, pickupAddress : Text, workHoursText : Text, deliveryNote : Text, minOrderCents : Nat, currencySymbol : Text) : async { ok : Bool; error : ?Text } {
    validateSession(token);
    settings := {
      brandName;
      pickupAddress;
      workHoursText;
      deliveryNote;
      minOrderCents;
      currencySymbol;
    };
    { ok = true; error = null };
  };

  // Image Upload to Blob Storage
  public shared ({ caller }) func adminUploadOfferImage(token : Text, offerId : Text, imageBytes : [Nat8], mimeType : Text, filename : Text) : async UploadImageResponse {
    validateSession(token);

    switch (offers.get(offerId)) {
      case (null) {
        { ok = false; imageId = null; imageUrl = null; error = ?"Offer not found" };
      };
      case (?_) {
        // Store image in BlobStorage
        let generateImageId = generateId();
        let url = "";
        // Actual blob-storage logic would go here
        { ok = true; imageId = ?generateImageId; imageUrl = ?url; error = null };
      };
    };
  };

  // Helper function to validate session
  func validateSession(token : Text) : () {
    switch (sessions.get(token)) {
      case (null) { Runtime.trap("Invalid or expired session") };
      case (?session) {
        if (session.expiresAt < Time.now()) {
          sessions.remove(token);
          Runtime.trap("Invalid or expired session");
        };
      };
    };
  };
};
