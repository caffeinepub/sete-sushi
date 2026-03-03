module {
  type OldActor = { adminPassword : Text };
  type NewActor = { adminPassword : Text };

  public func run(old : OldActor) : NewActor {
    { old with adminPassword = "sete123" };
  };
};
