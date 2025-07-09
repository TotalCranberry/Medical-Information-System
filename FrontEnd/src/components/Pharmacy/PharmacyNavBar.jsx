import React from "react";
import { AppBar, Toolbar, Button } from "@mui/material";
import { Link } from "react-router-dom";

const PharmacyNavBar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Button color="inherit" component={Link} to="/pharmacy">Dashboard</Button>
        <Button color="inherit" component={Link} to="/prescriptions">Prescriptions</Button>
        <Button color="inherit" component={Link} to="/inventory">Inventory</Button>
        <Button color="inherit" component={Link} to="/update-inventory">Update Inventory</Button>
      </Toolbar>
    </AppBar>
  );
};

export default PharmacyNavBar;
