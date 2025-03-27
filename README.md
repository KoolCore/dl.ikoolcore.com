# iKOOLCORE Download Center

iKOOLCORE Download Center for Users, including BIOS, Drivers, Firmwares, Guidance, Manuals, etc.

## 部署到树莓派 (Raspberry Pi Deployment)

### 准备工作 (Prerequisites)

1. 一台树莓派，推荐使用 Raspberry Pi 4 或更新版本
2. 已安装 Raspberry Pi OS (基于 Debian)
3. 连接到互联网
4. 可选：外部存储设备用于存储更多文件

### 安装步骤 (Installation Steps)

#### 1. 安装 Node.js 和 npm

```bash
# 更新系统
sudo apt update
sudo apt upgrade -y

# 安装 Node.js 和 npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# 验证安装
node -v
npm -v
```

#### 2. 克隆或复制项目文件到树莓派

```bash
# 方法1：如果使用Git
git clone https://your-repository-url.git /home/pi/dl.ikoolcore.com

# 方法2：手动复制文件到树莓派
# 使用SCP, SFTP或USB设备将文件传输到树莓派
```

#### 3. 安装项目依赖

```bash
cd /home/pi/dl.ikoolcore.com
npm install
```

#### 4. 设置自动启动服务

创建系统服务文件：

```bash
sudo nano /etc/systemd/system/ikoolcore-dl.service
```

添加以下内容：

```
[Unit]
Description=iKOOLCORE Download Center
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/pi/dl.ikoolcore.com
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=PORT=80

[Install]
WantedBy=multi-user.target
```

启用并启动服务：

```bash
sudo systemctl enable ikoolcore-dl.service
sudo systemctl start ikoolcore-dl.service
sudo systemctl status ikoolcore-dl.service
```

#### 5. 设置端口转发（推荐）

如果您想使用标准的HTTP端口(80)而不是3000端口，有两种方法：

**方法1：直接修改服务端口（推荐）**

修改服务配置文件，直接使用80端口启动服务：

```bash
sudo nano /etc/systemd/system/ikoolcore-dl.service
```

将Environment行修改为：
```
Environment=PORT=80
```

然后重新加载并重启服务：
```bash
sudo systemctl daemon-reload
sudo systemctl restart ikoolcore-dl.service
```

**注意**：在Linux系统中，使用1024以下的端口需要root权限。您需要以root用户运行Node.js应用，或者使用下面的端口转发方法。

**方法2：使用端口转发**

如果您希望保持Node.js应用以非root用户运行，可以使用iptables进行端口转发：

```bash
# 安装iptables
sudo apt install -y iptables

# 添加端口转发规则
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000

# 保存规则以便重启后仍然有效
sudo apt install -y iptables-persistent
sudo netfilter-persistent save
```

#### 6. 配置域名和HTTPS（可选）

如果您有域名并想配置HTTPS，可以使用Nginx和Let's Encrypt：

```bash
# 安装Nginx
sudo apt install -y nginx

# 安装Certbot（Let's Encrypt客户端）
sudo apt install -y certbot python3-certbot-nginx

# 配置Nginx
sudo nano /etc/nginx/sites-available/ikoolcore-dl
```

添加以下配置：

```
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用站点并获取SSL证书：

```bash
sudo ln -s /etc/nginx/sites-available/ikoolcore-dl /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com
```

### 文件管理

您可以通过以下方式管理下载中心的文件：

1. 直接在树莓派上添加/删除文件：
   ```bash
   # 例如，添加一个新的驱动文件
   cp /path/to/new-driver.zip /home/pi/dl.ikoolcore.com/Drivers/
   ```

2. 通过SFTP远程管理文件：
   - 使用FileZilla等SFTP客户端连接到树莓派
   - 导航到 `/home/pi/dl.ikoolcore.com` 目录
   - 上传或删除文件

3. 挂载外部存储（推荐用于大量文件）：
   ```bash
   # 挂载USB存储设备
   sudo mkdir -p /mnt/storage
   sudo mount /dev/sda1 /mnt/storage
   
   # 创建符号链接到网站目录
   ln -s /mnt/storage/files /home/pi/dl.ikoolcore.com/files
   
   # 设置自动挂载（编辑/etc/fstab）
   sudo nano /etc/fstab
   # 添加: /dev/sda1 /mnt/storage ext4 defaults 0 0
   ```

### 故障排除

1. 检查服务状态：
   ```bash
   sudo systemctl status ikoolcore-dl.service
   ```

2. 查看日志：
   ```bash
   sudo journalctl -u ikoolcore-dl.service
   ```

3. 检查端口是否正在监听：
   ```bash
   sudo netstat -tuln | grep 80
   ```

4. 重启服务：
   ```bash
   sudo systemctl restart ikoolcore-dl.service
   ```
