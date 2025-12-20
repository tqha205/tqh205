
const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

const dbConfig = {
    user: 'sa',           
    password: '123456', 
    server: 'localhost', 
    database: 'MobileStoreDB',
    options: {
        encrypt: true, 
        trustServerCertificate: true
    },
    pool: {
        max: 15,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

let pool;
const connectToDatabase = async () => {
    try {
        pool = await sql.connect(dbConfig);
        console.log('✅ Connected to SQL Server: MobileStoreDB');
    } catch (err) {
        console.error('❌ Database connection failed:', err);
    }
};
connectToDatabase();

const checkDb = (req, res, next) => {
    if (!pool || !pool.connected) return res.status(503).json({ message: 'Database offline' });
    next();
};

// --- MAPPERS ---
const mapUser = (u) => ({
    id: u.Id.toString(),
    name: u.Name,
    username: u.Username,
    role: u.Role,
    tier: u.Tier || 'silver',
    points: u.Points || 0,
    phone: u.Phone,
    email: u.Email,
    address: u.Address
});

const mapProduct = (p) => ({
    id: p.Id.toString(),
    name: p.Name,
    brand: p.Brand,
    price: p.Price,
    originalPrice: p.OriginalPrice,
    stock: p.Stock,
    image: p.Image,
    status: p.Status,
    description: p.Description,
    features: p.Features ? JSON.parse(p.Features) : [],
    promotion: p.Promotion,
    imeis: p.ImeisJson ? JSON.parse(p.ImeisJson).map(i => i.Imei) : []
});

// --- AUTH API ---

app.post('/api/register', checkDb, async (req, res) => {
    try {
        const { name, username, password } = req.body;
        const check = await pool.request()
            .input('u', sql.VarChar, username)
            .query('SELECT Id FROM Users WHERE Username = @u');
            
        if (check.recordset.length > 0) return res.status(400).send('Tài khoản đã tồn tại');

        const result = await pool.request()
            .input('n', sql.NVarChar, name)
            .input('u', sql.VarChar, username)
            .input('p', sql.VarChar, password)
            .query(`INSERT INTO Users (Name, Username, Password, Role, Tier, Points) 
                    OUTPUT INSERTED.* 
                    VALUES (@n, @u, @p, 'CUSTOMER', 'silver', 0)`);
        
        const u = result.recordset[0];
        res.status(201).json({ user: mapUser(u), token: 'token-' + u.Id });
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/login', checkDb, async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await pool.request()
            .input('u', sql.VarChar, username)
            .input('p', sql.VarChar, password)
            .query('SELECT * FROM Users WHERE Username = @u AND Password = @p');
        
        if (result.recordset.length > 0) {
            const u = result.recordset[0];
            res.json({ user: mapUser(u), token: 'token-' + u.Id });
        } else {
            res.status(401).send('Sai tài khoản hoặc mật khẩu');
        }
    } catch (err) { res.status(500).send(err.message); }
});

// --- PRODUCT API ---
app.get('/api/products', checkDb, async (req, res) => {
    try {
        const result = await pool.request().query(`
            SELECT p.*, 
            (SELECT Imei FROM ProductIMEIs WHERE ProductId = p.Id AND Status = 'available' FOR JSON PATH) as ImeisJson
            FROM Products p
        `);
        res.json(result.recordset.map(mapProduct));
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/products', checkDb, async (req, res) => {
    try {
        const p = req.body;
        await pool.request()
            .input('n', sql.NVarChar, p.name)
            .input('b', sql.NVarChar, p.brand)
            .input('pr', sql.Float, p.price)
            .input('op', sql.Float, p.originalPrice)
            .input('s', sql.Int, p.stock)
            .input('i', sql.NVarChar, p.image)
            .input('st', sql.NVarChar, p.status)
            .input('d', sql.NVarChar, p.description)
            .input('f', sql.NVarChar, JSON.stringify(p.features))
            .query(`INSERT INTO Products (Name, Brand, Price, OriginalPrice, Stock, Image, Status, Description, Features) 
                    VALUES (@n, @b, @pr, @op, @s, @i, @st, @d, @f)`);
        res.status(201).json({ success: true });
    } catch (err) { res.status(500).send(err.message); }
});

app.put('/api/products/:id', checkDb, async (req, res) => {
    try {
        const p = req.body;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('n', sql.NVarChar, p.name)
            .input('b', sql.NVarChar, p.brand)
            .input('pr', sql.Float, p.price)
            .input('s', sql.Int, p.stock)
            .input('st', sql.NVarChar, p.status)
            .query(`UPDATE Products SET Name=@n, Brand=@b, Price=@pr, Stock=@s, Status=@st WHERE Id=@id`);
        res.json({ success: true });
    } catch (err) { res.status(500).send(err.message); }
});

app.delete('/api/products/:id', checkDb, async (req, res) => {
    try {
        await pool.request().input('id', sql.Int, req.params.id).query('DELETE FROM Products WHERE Id=@id');
        res.json({ success: true });
    } catch (err) { res.status(500).send(err.message); }
});

// --- OTHER APIS ---
app.get('/api/users', checkDb, async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Users');
        res.json(result.recordset.map(mapUser));
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/api/users/:id', checkDb, async (req, res) => {
    try {
        const result = await pool.request().input('id', sql.Int, req.params.id).query('SELECT * FROM Users WHERE Id=@id');
        if (result.recordset[0]) res.json(mapUser(result.recordset[0]));
        else res.status(404).send('Not found');
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/api/suppliers', checkDb, async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Suppliers');
        res.json(result.recordset.map(s => ({ id: s.Id.toString(), name: s.Name, phone: s.Phone, email: s.Email, address: s.Address })));
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/api/orders', checkDb, async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM Orders ORDER BY CreatedAt DESC');
        res.json(result.recordset.map(o => ({
            id: o.Id.toString(),
            userId: o.UserId ? o.UserId.toString() : null,
            customerName: o.CustomerName,
            total: o.TotalAmount,
            paymentMethod: o.PaymentMethod,
            status: o.Status,
            date: o.CreatedAt,
            items: o.ItemsJson ? JSON.parse(o.ItemsJson) : [],
            customerInfo: o.CustomerInfoJson ? JSON.parse(o.CustomerInfoJson) : {}
        })));
    } catch (err) { res.status(500).send(err.message); }
});

app.listen(PORT, () => console.log(`🚀 Original System Backend running on http://localhost:${PORT}`));
