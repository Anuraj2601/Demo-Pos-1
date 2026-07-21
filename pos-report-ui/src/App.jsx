import { useEffect, useState } from "react";
import api from "./api";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
} from "@mui/material";

import {
  People,
  Inventory,
  ShoppingCart,
  Warning,
  Refresh,
} from "@mui/icons-material";

function App() {
  const [dashboard, setDashboard] = useState({
    customers: 0,
    products: 0,
    sales: 0,
    lowStock: 0,
  });

  const [sales, setSales] = useState([]);

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [dashboardResponse, salesResponse, productsResponse] =
        await Promise.all([
          api.get("/dashboard"),
          api.get("/sales"),
          api.get("/products"),
        ]);

      setDashboard(dashboardResponse.data);

      setSales(salesResponse.data);

      setProducts(productsResponse.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const SummaryCard = ({ title, value, icon }) => {
    return (
      <Card
        sx={{
          borderRadius: 3,
          background: "#ffffff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 3,
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight="500">
              {title}
            </Typography>

            <Typography
              variant="h4"
              fontWeight="700"
              sx={{
                marginTop: 1,
              }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 55,

              height: 55,

              borderRadius: "50%",

              background: "#f1f3f5",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </CardContent>
      </Card>
    );
  };

  const SectionTitle = ({ children }) => (
    <Typography fontWeight="700" fontSize={18} mb={2}>
      {children}
    </Typography>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",

        background: "#f6f6f7",

        padding: {
          xs: 2,
          md: 4,
        },
      }}
    >
      {/* HEADER */}

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight="700">
            POS Dashboard
          </Typography>

          <Typography color="text.secondary">
            Business Overview and Reports
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<Refresh />} onClick={loadData}>
          Refresh
        </Button>
      </Box>

      {/* SUMMARY CARDS */}
      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <SummaryCard
            title="Customers"
            value={dashboard.customers}
            icon={<People />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <SummaryCard
            title="Products"
            value={dashboard.products}
            icon={<Inventory />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <SummaryCard
            title="Orders"
            value={dashboard.sales}
            icon={<ShoppingCart />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <SummaryCard
            title="Low Stock"
            value={dashboard.lowStock}
            icon={<Warning />}
          />
        </Grid>
      </Grid>

      {/* SALES TABLE */}

      <Card
        sx={{
          mt: 4,

          borderRadius: 3,

          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent>
          <SectionTitle>Recent Sales</SectionTitle>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Invoice</TableCell>

                  <TableCell>Customer</TableCell>

                  <TableCell>Amount</TableCell>

                  <TableCell>Payment</TableCell>

                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sales.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>{row.invoice_no}</TableCell>

                    <TableCell>{row.customer_name}</TableCell>

                    <TableCell>${row.total_amount}</TableCell>

                    <TableCell>{row.payment_method}</TableCell>

                    <TableCell>
                      <Chip label="Completed" size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* PRODUCTS TABLE */}

      <Card
        sx={{
          mt: 4,

          borderRadius: 3,

          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        }}
      >
        <CardContent>
          <SectionTitle>Product Inventory</SectionTitle>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>

                  <TableCell>Category</TableCell>

                  <TableCell>Price</TableCell>

                  <TableCell>Stock</TableCell>

                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {products.map((item) => (
                  <TableRow hover key={item.id}>
                    <TableCell>{item.name}</TableCell>

                    <TableCell>{item.category}</TableCell>

                    <TableCell>${item.price}</TableCell>

                    <TableCell>{item.stock}</TableCell>

                    <TableCell>
                      {item.stock < 10 ? (
                        <Chip label="Low Stock" size="small" color="warning" />
                      ) : (
                        <Chip label="Available" size="small" color="success" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default App;
