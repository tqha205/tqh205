
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

// Hàm khởi tạo dữ liệu mẫu (Auto-Seeding)
const seedDatabase = async () => {
    try {
        console.log('🔄 Checking database integrity...');
        
        // 1. Tạo bảng Users
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
            CREATE TABLE Users (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                Name NVARCHAR(100),
                Username VARCHAR(50) UNIQUE,
                Password VARCHAR(100),
                Role VARCHAR(20),
                Tier VARCHAR(20) DEFAULT 'silver',
                Points INT DEFAULT 0,
                Phone VARCHAR(20),
                Email VARCHAR(100),
                Address NVARCHAR(255),
                CreatedAt DATETIME DEFAULT GETDATE()
            )
        `);

        // 2. Tạo bảng Products
        await pool.request().query(`
             IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Products' AND xtype='U')
             CREATE TABLE Products (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                Name NVARCHAR(200),
                Brand NVARCHAR(50),
                Price FLOAT,
                OriginalPrice FLOAT,
                Stock INT,
                Image NVARCHAR(MAX),
                Status NVARCHAR(50),
                Description NVARCHAR(MAX),
                Features NVARCHAR(MAX),
                Promotion NVARCHAR(200)
             )
        `);

        // 3. Tạo bảng Orders
        await pool.request().query(`
             IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Orders' AND xtype='U')
             CREATE TABLE Orders (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                UserId INT,
                CustomerName NVARCHAR(100),
                TotalAmount FLOAT,
                PaymentMethod VARCHAR(20),
                Status VARCHAR(20),
                CreatedAt DATETIME DEFAULT GETDATE(),
                ItemsJson NVARCHAR(MAX),
                CustomerInfoJson NVARCHAR(MAX)
             )
        `);

        // 4. Tạo bảng Suppliers
        await pool.request().query(`
             IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Suppliers' AND xtype='U')
             CREATE TABLE Suppliers (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                Name NVARCHAR(100),
                Phone VARCHAR(20),
                Email VARCHAR(100),
                Address NVARCHAR(255)
             )
        `);

        // 5. Tạo bảng InventoryLogs
        await pool.request().query(`
             IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='InventoryLogs' AND xtype='U')
             CREATE TABLE InventoryLogs (
                Id INT IDENTITY(1,1) PRIMARY KEY,
                ProductId INT,
                Type VARCHAR(20),
                Quantity INT,
                Reason NVARCHAR(200),
                Date DATETIME DEFAULT GETDATE(),
                PerformedBy NVARCHAR(100)
             )
        `);

        // --- SEED DATA ---

        // Seed Users (Admin & Staff)
        const checkAdmin = await pool.request().query("SELECT * FROM Users WHERE Username = 'admin'");
        if (checkAdmin.recordset.length === 0) {
            await pool.request().query(`
                INSERT INTO Users (Name, Username, Password, Role, Tier, Points) 
                VALUES (N'Quản Trị Viên', 'admin', '123', 'ADMIN', 'diamond', 9999)
            `);
            console.log('✨ Account Created: admin / 123');
        }

        const checkStaff = await pool.request().query("SELECT * FROM Users WHERE Username = 'staff'");
        if (checkStaff.recordset.length === 0) {
            await pool.request().query(`
                INSERT INTO Users (Name, Username, Password, Role, Tier, Points) 
                VALUES (N'Nhân Viên Kho', 'staff', '123', 'STAFF', 'silver', 0)
            `);
            console.log('✨ Account Created: staff / 123');
        }

        // Seed Products (Nếu bảng trống)
        const checkProducts = await pool.request().query("SELECT COUNT(*) as count FROM Products");
        if (checkProducts.recordset[0].count === 0) {
            await pool.request().query(`
                INSERT INTO Products (Name, Brand, Price, OriginalPrice, Stock, Image, Status, Description, Features) VALUES 
                (N'iPhone 15 Pro Max', 'Apple', 30990000, 34990000, 15, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png', N'Kinh doanh', N'Sản phẩm cao cấp nhất của Apple với khung titan.', '["Chip A17 Pro", "Titanium Frame", "Camera 5x"]'),
                (N'Samsung Galaxy S24 Ultra', 'Samsung', 26990000, 33990000, 20, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/s/ss-s24-ultra-xam-2.png', N'Kinh doanh', N'Điện thoại AI tiên phong.', '["Galaxy AI", "Snapdragon 8 Gen 3", "S-Pen"]'),
                (N'Xiaomi 14 Ultra', 'Xiaomi', 21990000, 24990000, 5, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/x/i/xiaomi-14-ultra_1.png', N'Kinh doanh', N'Đỉnh cao nhiếp ảnh Leica.', '["Leica Optics", "Snapdragon 8 Gen 3"]'),
                (N'OPPO Find N3', 'Oppo', 41990000, 44990000, 3, 'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/o/p/oppo-find-n3-vang-1.png', N'Kinh doanh', N'Bậc thầy gập mở.', '["Foldable", "Hasselblad Camera"]')
            `);
            console.log('✨ Default Products created');
        }

        // Seed Suppliers (Nếu bảng trống)
        const checkSuppliers = await pool.request().query("SELECT COUNT(*) as count FROM Suppliers");
        if (checkSuppliers.recordset[0].count === 0) {
            await pool.request().query(`
                INSERT INTO Suppliers (Name, Phone, Email, Address) VALUES 
                (N'Apple Vietnam', '18001127', 'contact@apple.com.vn', N'Quận 7, TP.HCM'),
                (N'Samsung Vina', '18005888', 'support@samsung.com', N'Bitexco, TP.HCM'),
                (N'Xiaomi Global', '19001111', 'service.vn@xiaomi.com', N'Cầu Giấy, Hà Nội')
            `);
            console.log('✨ Default Suppliers created');
        }

        console.log('✅ Database check complete.');
    } catch (err) {
        console.error('⚠️ Seeding error:', err.message);
    }
};

const connectToDatabase = async () => {
    try {
        pool = await sql.connect(dbConfig);
        console.log('✅ Connected to SQL Server: MobileStoreDB');
        await seedDatabase();
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
    } catch (err) { 
        console.error(err);
        res.status(500).send(err.message); 
    }
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

// API quan ly kho don gian
app.get('/api/inventory/logs', checkDb, async (req, res) => {
    try {
        const result = await pool.request().query('SELECT * FROM InventoryLogs ORDER BY Date DESC');
        res.json(result.recordset.map(l => ({
            id: l.Id.toString(),
            productId: l.ProductId.toString(),
            type: l.Type,
            quantity: l.Quantity,
            reason: l.Reason,
            date: l.Date,
            performedBy: l.PerformedBy,
            // Mock product info for now since we didn't join tables
            productName: "Sản phẩm " + l.ProductId,
            productImage: "https://via.placeholder.com/50" 
        })));
    } catch (err) { res.status(500).send(err.message); }
});

app.post('/api/inventory/adjust', checkDb, async (req, res) => {
    try {
        const { id, quantity, type, reason, user } = req.body;
        
        // 1. Log transaction
        await pool.request()
            .input('pid', sql.Int, id)
            .input('t', sql.VarChar, type)
            .input('q', sql.Int, quantity)
            .input('r', sql.NVarChar, reason)
            .input('u', sql.NVarChar, user)
            .query("INSERT INTO InventoryLogs (ProductId, Type, Quantity, Reason, PerformedBy) VALUES (@pid, @t, @q, @r, @u)");

        // 2. Update stock
        const operator = type === 'import' ? '+' : '-';
        await pool.request()
            .input('id', sql.Int, id)
            .input('q', sql.Int, quantity)
            .query(`UPDATE Products SET Stock = Stock ${operator} @q WHERE Id = @id`);

        res.json({ success: true });
    } catch (err) { res.status(500).send(err.message); }
});

app.listen(PORT, () => console.log(`🚀 System Ready. Test accounts: admin/123, staff/123. Port: ${PORT}`));
