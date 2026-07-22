import { useEffect, useState } from "react";
import api from "./api";

import {
  Box, Typography, Card, CardContent, Grid,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button,
  Tabs, Tab, TextField, InputAdornment,
  TablePagination,
} from "@mui/material";

import {
  People, Inventory, Warning, Refresh,
  Storefront, ArrowBack, Search,
} from "@mui/icons-material";

const BRANCH_COLORS = {
  "1COL": "#1976d2",
  "2JAF": "#388e3c",
  "3KEY": "#f57c00",
  "4PW1": "#7b1fa2",
  "5PW2": "#d32f2f",
};

function DynamicTable({ data, filter }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = filter
    ? data.filter((row) =>
        Object.values(row).some((v) =>
          v != null && String(v).toLowerCase().includes(filter.toLowerCase())
        )
      )
    : data;

  useEffect(() => {
    setPage(0);
  }, [filter, data]);

  if (!filtered || filtered.length === 0) {
    return <Typography color="text.secondary">No data available</Typography>;
  }

  const columns = Object.keys(filtered[0]);
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <TableContainer sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col} sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((row, i) => (
              <TableRow hover key={i}>
                {columns.map((col) => (
                  <TableCell key={col} sx={{ whiteSpace: "nowrap" }}>{row[col] != null ? String(row[col]) : ""}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}

function App() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [dashboard, setDashboard] = useState({
    customers: 0, products: 0, Stock: 0,
  });
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/branches").then((res) => setBranches(res.data)).catch(console.log);
  }, []);

  useEffect(() => {
    if (selectedBranch) loadData();
  }, [selectedBranch]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [d, c, s, p, st] = await Promise.all([
        api.get("/dashboard", { params: { branch: selectedBranch } }),
        api.get("/customers", { params: { branch: selectedBranch } }),
        api.get("/sales", { params: { branch: selectedBranch } }),
        api.get("/products", { params: { branch: selectedBranch } }),
        api.get("/stock", { params: { branch: selectedBranch } }),
      ]);
      setDashboard(d.data);
      setCustomers(c.data);
      setSales(s.data);
      setProducts(p.data);
      setStock(st.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const SummaryCard = ({ title, value, icon }) => (
    <Card sx={{ borderRadius: 3, background: "#ffffff", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" , marginBottom: "20px"}}>
      <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 3 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight="500">{title}</Typography>
          <Typography variant="h4" fontWeight="700" sx={{ marginTop: 1 }}>{value}</Typography>
        </Box>
        <Box sx={{ width: 55, height: 55, borderRadius: "50%", background: "#f1f3f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </Box>
      </CardContent>
    </Card>
  );

  const SectionTitle = ({ children }) => (
    <Typography fontWeight="700" fontSize={18} mb={2}>{children}</Typography>
  );

  // BRANCH SELECTION SCREEN
  if (!selectedBranch) {
    return (
      <Box sx={{ minHeight: "100vh", background: "#f6f6f7", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 3 }}>
        <Typography variant="h4" fontWeight="700" mb={1}>POS Dashboard</Typography>
        <Typography color="text.secondary" mb={4}>Select a branch to view its data</Typography>
        <Grid container spacing={3} sx={{ maxWidth: 900 }}>
          {branches.map((branch) => (
            <Grid key={branch.branchCode} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                onClick={() => setSelectedBranch(branch.branchCode)}
                sx={{
                  borderRadius: 3, cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  transition: "all 0.2s",
                  "&:hover": { boxShadow: "0 6px 20px rgba(0,0,0,0.15)", transform: "translateY(-4px)" },
                }}
              >
                <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, padding: 3 }}>
                  <Box sx={{
                    width: 55, height: 55, borderRadius: "50%",
                    background: BRANCH_COLORS[branch.branchCode] || "#666",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Storefront sx={{ color: "#fff", fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="600">{branch.branchName}</Typography>
                    <Typography variant="body2" color="text.secondary">{branch.branchCode}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const branchName = branches.find((b) => b.branchCode === selectedBranch)?.branchName;

  const tabLabels = ["Customers", "Products", "Stock"];
  const tabData = [customers, products, stock];

  return (
    <Box sx={{ minHeight: "100vh", background: "#f6f6f7", padding: { xs: 2, md: 4 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => {
            setSelectedBranch(null);
            setDashboard({ customers: 0, products: 0, Stock: 0 });
            setCustomers([]);
            setSales([]);
            setProducts([]);
            setStock([]);
            setTab(0);
            setSearch("");
          }}>
            Back
          </Button>
          <Box>
            <Typography variant="h4" fontWeight="700">{branchName}</Typography>
            <Typography color="text.secondary">Business Overview and Reports</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<Refresh />} onClick={loadData} disabled={loading}>
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3} mb={6}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard title="Customers" value={dashboard.customers} icon={<People />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard title="Products" value={dashboard.products} icon={<Inventory />} />
        </Grid>
        {/* <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard title="Orders" value={dashboard.sales} icon={<ShoppingCart />} />
        </Grid> */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard title="Stock" value={dashboard.Stock} icon={<Warning />} />
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 15px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ alignItems: "flex-start", textAlign: "left" }}>
          <Tabs
            value={tab}
            onChange={(_, v) => { setTab(v); setSearch(""); }}
            sx={{ mb: 2 }}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabLabels.map((label, i) => (
              <Tab key={label} label={`${label} (${tabData[i].length})`} />
            ))}
          </Tabs>
          <SectionTitle>{tabLabels[tab]}</SectionTitle>
          <TextField
            size="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2, width: { xs: "100%", sm: 300 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><Search /></InputAdornment>
              ),
            }}
          />
          <DynamicTable data={tabData[tab]} filter={search} />
        </CardContent>
      </Card>
    </Box>
  );
}

export default App;
