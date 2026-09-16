# iKOOLCORE Download Center

iKOOLCORE 官方技术资源下载中心，用于集中发布和管理 BIOS、固件、驱动程序、用户手册及部署文档。

项目采用 **Node.js + Express + 原生 HTML/CSS/JavaScript** 构建，无需数据库和前端构建工具。服务器目录中的文件会被自动读取，并以外观统一、支持搜索和响应式布局的下载中心页面展示。

---

## 目录

- [功能概览](#功能概览)
- [环境要求](#环境要求)
- [快速启动](#快速启动)
- [项目结构](#项目结构)
- [网页端使用说明](#网页端使用说明)
- [管理员使用说明](#管理员使用说明)
- [文件与目录规则](#文件与目录规则)
- [配置说明](#配置说明)
- [接口说明](#接口说明)
- [部署到 Linux 或树莓派](#部署到-linux-或树莓派)
- [使用 Nginx 和 HTTPS](#使用-nginx-和-https)
- [更新与备份](#更新与备份)
- [故障排查](#故障排查)
- [安全建议](#安全建议)

---

## 功能概览

- 自动读取 files 目录中的文件和子目录。
- 目录优先、文件名称排序的清晰列表结构。
- 根据文件扩展名自动显示 PDF、ZIP、EXE、ISO、BIN 等类型图标。
- 自动显示文件大小和最后修改时间。
- 支持当前目录内的关键词搜索。
- 支持目录进入、返回上级目录和面包屑导航。
- 支持浅色和深色主题，并通过浏览器保存主题选择。
- 支持桌面端、平板和手机端响应式布局。
- 支持快捷键 / 快速聚焦搜索框。
- 提供加载状态、空结果状态和错误提示。
- 支持 Nginx 反向代理和 HTTPS。
- 无需数据库，文件放入目录后即可发布。

---

## 环境要求

### 必需环境

| 组件 | 要求 |
| --- | --- |
| Node.js | 推荐 18 LTS 或更高版本 |
| npm | 随 Node.js 一起安装 |
| 操作系统 | Windows、Linux、macOS、Raspberry Pi OS |
| 浏览器 | Chrome、Edge、Firefox、Safari 等现代浏览器 |

### 检查环境

~~~bash
node -v
npm -v
~~~

如果终端能够正常输出版本号，即可继续安装项目。

---

## 快速启动

### 1. 获取项目

~~~bash
git clone <你的仓库地址> dl.ikoolcore.com
cd dl.ikoolcore.com
~~~

如果是通过压缩包或移动硬盘获取项目，直接进入项目根目录即可。

### 2. 安装依赖

~~~bash
npm install
~~~

项目生产依赖只有 Express，安装过程通常很快。

### 3. 启动服务

server.js 默认使用 80 端口。为了在开发环境中避免管理员权限和端口冲突，建议显式指定 3000 端口。

#### Windows PowerShell

~~~powershell
$env:PORT=3000
npm start
~~~

#### Linux 或 macOS

~~~bash
PORT=3000 npm start
~~~

#### 开发模式

开发模式会使用 nodemon，在修改 server.js 后自动重启：

~~~powershell
$env:PORT=3000
npm run dev
~~~

#### 使用默认 80 端口

Linux 或 macOS：

~~~bash
npm run start:80
~~~

Windows 管理员 PowerShell：

~~~powershell
$env:PORT=80
npm start
~~~

注意：Linux 中监听 1024 以下的端口需要额外权限，Windows 中也需要管理员权限。生产环境更推荐使用 3000 端口配合 Nginx 反向代理。

### 4. 打开下载中心

启动成功后访问：

- 3000 端口：http://localhost:3000
- 80 端口：http://localhost

局域网中的其他设备可以使用服务器 IP，例如：

~~~text
http://192.168.1.100:3000
~~~

---

## 项目结构

~~~text
dl.ikoolcore.com/
├─ files/                 # 对外发布的下载资源目录
│  ├─ BIOS/               # BIOS、固件和更新包
│  ├─ Drivers/            # 驱动程序和兼容性软件
│  └─ Manuals/            # 用户手册和说明文档
├─ index.html             # 页面结构和内容
├─ style.css              # 视觉系统与响应式样式
├─ script.js              # 目录读取、搜索和交互逻辑
├─ server.js              # Express 服务和文件接口
├─ package.json           # 项目依赖与运行脚本
├─ package-lock.json      # 依赖版本锁定
├─ favicon.png            # 浏览器图标
├─ font.woff              # 本地字体资源
├─ robots.txt             # 搜索引擎抓取规则
└─ README.md              # 使用与部署文档
~~~

files 是唯一需要日常维护的资源目录。其他文件主要用于网站运行，不建议在服务器上直接修改。

---

## 网页端使用说明

### 浏览资源

1. 打开下载中心首页。
2. 首页会显示 files 根目录下的资源类别。
3. 点击文件夹名称或 Open 按钮进入对应目录。
4. 点击文件名或 Download 按钮下载文件。
5. 使用面包屑导航或 Back to parent directory 返回上一级。

页面会自动显示：

- 当前目录中的资源数量。
- 最新资源更新时间。
- 文件类型。
- 文件大小。
- 文件最后修改时间。

### 搜索资源

在搜索框中输入以下任意内容：

- 产品型号，例如 R2 Max。
- 组件名称，例如 BIOS、网卡、Wi-Fi。
- 文件类型，例如 PDF、ZIP、EXE。
- 版本号，例如 v2.1、1.0。
- 文件名中的其他关键词。

按下 Enter 后，页面会显示当前目录中的匹配结果。

> **重要说明**
>
> 当前搜索不是全局递归搜索。它只在当前所在目录中查找文件和子目录。
>
> 例如，在首页搜索 BIOS 会找到 BIOS 文件夹；如果要搜索 BIOS 文件夹内的具体文件，需要先进入 BIOS 目录，再执行搜索。

### 常用快捷键

| 快捷键 | 功能 |
| --- | --- |
| / | 当焦点不在输入框中时，快速聚焦搜索框 |
| Enter | 提交搜索 |
| Esc | 清空搜索框中的内容 |

### 切换主题

点击右上角的主题按钮即可在浅色和深色模式之间切换。选择结果会保存在当前浏览器中，下次访问时会继续使用对应主题。

### 手机端使用

手机端会自动切换为单栏布局：

- 搜索框和按钮纵向排列。
- 资源列表保留名称、描述和操作入口。
- 页面顶部保留必要的导航。
- 在页面顶部下拉可以触发内容刷新。
- 页面支持安全区域和触摸操作。

---

## 管理员使用说明

管理员不需要登录后台，也没有独立的上传页面。资源通过服务器的 files 目录进行管理。

### 发布新文件

将文件放入 files 下对应的类别目录中，例如：

~~~text
files/Drivers/new-network-driver_v1.2.zip
files/BIOS/BIOS_R2_v2.2.bin
files/Manuals/R2_Max_User_Manual.pdf
~~~

刷新网页后，新文件会自动出现在列表中，无需修改数据库或重新启动服务。

### 新建资源分类

如果需要增加新的资源类型，可以直接在 files 下创建目录：

~~~text
files/Firmware/
files/Utilities/
files/Release Notes/
~~~

新目录会自动显示在首页。

### 调整排序

服务器会按照以下规则排序：

1. 文件夹排在文件前面。
2. 同类型项目按照名称排序。

如果要人工调整顺序，可以使用数字前缀，例如：

~~~text
01_BIOS
02_Drivers
03_Manuals
~~~

页面显示时，文件名中的下划线会自动转换为空格。

### 删除资源

从服务器文件系统中删除对应文件或目录，然后刷新页面。

删除后无法通过网页恢复，请确保已有备份。

### 推荐的文件命名方式

建议采用以下格式：

~~~text
产品型号_组件_版本_日期.扩展名
~~~

示例：

~~~text
R2_Max_BIOS_v2.2_2026-09-16.bin
R2_POE_Driver_Windows_v1.3.zip
R1_Pro_User_Manual_ZH_CN.pdf
~~~

推荐使用的字符：

- 英文大小写字母
- 中文
- 数字
- 下划线
- 连字符
- 圆括号

不建议在文件名中使用：

- 反斜杠
- 正斜杠
- 问号
- 井号
- 百分号
- 冒号
- 前后空格

### 隐藏文件规则

以下文件不会显示在下载中心中：

- 以点开头的文件
- .DS_Store
- Thumbs.db

---

## 文件与目录规则

### 目录与文件

服务器会检查每个项目的真实文件系统类型：

- 目录类型会显示 Folder 和 Open。
- 文件类型会显示 Download。
- 文件大小来自服务器中的实际文件。
- 更新时间来自文件系统的最后修改时间。

### 中文和英文文件名

页面支持中英文混合文件名。中文使用中文字体，英文和数字使用品牌字体。

### 空目录

空目录可以正常显示。进入空目录后，页面会显示当前目录中没有可用文件。

### 外部存储

资源文件较多时，可以将外部存储挂载到 files 目录。

~~~bash
sudo mkdir -p /mnt/ikoolcore-storage
sudo mount /dev/sda1 /mnt/ikoolcore-storage

mv /home/pi/dl.ikoolcore.com/files /home/pi/dl.ikoolcore.com/files.backup
ln -s /mnt/ikoolcore-storage /home/pi/dl.ikoolcore.com/files
~~~

建议在修改前先备份原 files 目录，并确认外部存储挂载稳定。

---

## 配置说明

### 端口配置

server.js 读取 PORT 环境变量：

~~~js
const port = process.env.PORT || 80;
~~~

未设置 PORT 时使用 80 端口。

#### Windows

~~~powershell
$env:PORT=3000
npm start
~~~

#### Linux

~~~bash
export PORT=3000
npm start
~~~

### 主机名访问

服务启动后，控制台会输出可访问地址，例如：

~~~text
iKOOLCORE Download Center running on port 3000
Access the download center at http://server-name:3000
~~~

### 修改页面文案

页面文字位于 index.html，视觉样式位于 style.css，目录和搜索逻辑位于 script.js。

如果修改了 CSS 或 JavaScript，建议同步更新 index.html 中的版本参数，使浏览器重新加载缓存：

~~~html
<link rel="stylesheet" href="/style.css?2026091601">
<script src="/script.js?2026091601" defer></script>
~~~

---

## 接口说明

### 获取目录列表

~~~http
GET /idx/<目录路径>
~~~

示例：

~~~http
GET /idx/
GET /idx/BIOS/
GET /idx/Drivers/
~~~

返回内容：

~~~json
[
  {
    "name": "BIOS_R2_v2.1.bin",
    "type": "file",
    "size": 10485760,
    "lastModified": "2026-09-16T12:00:00.000Z"
  }
]
~~~

### 搜索当前目录

~~~http
GET /idx/<目录路径>?r=1&q=<关键词>
~~~

示例：

~~~http
GET /idx/Drivers/?r=1&q=network
~~~

### 下载文件

~~~http
GET /dl/<文件路径>
~~~

示例：

~~~http
GET /dl/BIOS/BIOS_R2_v2.1.bin
~~~

### 前端路由

除 /idx/ 和 /dl/ 之外的普通页面请求会返回 index.html，用于支持目录 URL：

~~~text
/BIOS
/Drivers
/Manuals
~~~

---

## 部署到 Linux 或树莓派

以下示例以 Raspberry Pi OS 或 Debian 系 Linux 为例。

### 1. 安装 Node.js

推荐使用 NodeSource 安装较新的 LTS 版本。实际安装命令应使用 NodeSource 当前推荐的 LTS 脚本。

安装后验证：

~~~bash
node -v
npm -v
~~~

### 2. 安装项目

~~~bash
cd /home/pi
git clone <你的仓库地址> dl.ikoolcore.com
cd dl.ikoolcore.com
npm install
~~~

### 3. 创建 systemd 服务

推荐使用非 root 用户运行 Node.js，并让应用监听 3000 端口。

~~~bash
sudo nano /etc/systemd/system/ikoolcore-dl.service
~~~

配置内容：

~~~ini
[Unit]
Description=iKOOLCORE Download Center
After=network.target

[Service]
Type=simple
User=pi
Group=pi
WorkingDirectory=/home/pi/dl.ikoolcore.com
ExecStart=/usr/bin/node server.js
Environment=PORT=3000
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
~~~

如果 Node.js 不在 /usr/bin/node，可以运行以下命令确认路径：

~~~bash
which node
~~~

### 4. 启动服务

~~~bash
sudo systemctl daemon-reload
sudo systemctl enable ikoolcore-dl.service
sudo systemctl start ikoolcore-dl.service
sudo systemctl status ikoolcore-dl.service
~~~

查看实时日志：

~~~bash
sudo journalctl -u ikoolcore-dl.service -f
~~~

---

## 使用 Nginx 和 HTTPS

生产环境推荐让 Node.js 监听 3000 端口，由 Nginx 对外提供 80 和 443 端口。

### 1. 安装 Nginx

~~~bash
sudo apt update
sudo apt install -y nginx
~~~

### 2. 创建站点配置

~~~bash
sudo nano /etc/nginx/sites-available/ikoolcore-dl
~~~

配置示例：

~~~nginx
server {
    listen 80;
    server_name dl.example.com;

    client_max_body_size 0;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600;
    }
}
~~~

### 3. 启用站点

~~~bash
sudo ln -s /etc/nginx/sites-available/ikoolcore-dl /etc/nginx/sites-enabled/ikoolcore-dl
sudo nginx -t
sudo systemctl reload nginx
~~~

### 4. 配置 HTTPS

~~~bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d dl.example.com
~~~

配置完成后，使用以下地址访问：

~~~text
https://dl.example.com
~~~

---

## 更新与备份

### 更新项目代码

~~~bash
cd /home/pi/dl.ikoolcore.com
git pull
npm install
sudo systemctl restart ikoolcore-dl.service
~~~

### 更新资源文件

资源文件通常不需要通过 Git 管理。可以直接通过 SFTP、SSH 或挂载目录上传到 files 中。

### 备份建议

至少备份：

- files 目录
- server.js
- package.json
- package-lock.json
- /etc/systemd/system/ikoolcore-dl.service
- Nginx 站点配置

简单备份命令：

~~~bash
tar -czf ikoolcore-download-center-backup.tar.gz \
  files server.js package.json package-lock.json
~~~

---

## 故障排查

### 端口被占用

表现：

~~~text
Error: listen EADDRINUSE
~~~

处理方法：

1. 更换端口。
2. 关闭占用端口的程序。
3. 修改 systemd 中的 PORT 配置后重启服务。

Linux 查看端口：

~~~bash
sudo ss -lntp | grep 3000
~~~

### 80 端口权限不足

表现：

~~~text
Error: listen EACCES
~~~

处理方法：

- 开发环境改用 3000 端口。
- 生产环境使用 Nginx 反向代理。

### 页面能打开但列表为空

检查：

1. files 目录是否存在。
2. files 中是否有普通文件或子目录。
3. 文件是否被隐藏文件规则过滤。
4. Node.js 进程是否有读取 files 的权限。
5. 浏览器 Network 面板中的 /idx/ 请求是否返回 200。

### 文件上传后没有立即出现

处理方法：

1. 刷新浏览器。
2. 确认文件位于正确的 files 子目录。
3. 检查文件名大小写。
4. 检查 Node.js 进程是否具有目录读取权限。
5. 查看服务器输出或 journalctl 日志。

### 点击下载返回 404

检查文件路径是否与网页中的路径一致，并确认：

~~~bash
ls -lah files/BIOS/
~~~

### 中文文件名无法访问

确认服务器系统、浏览器和文件系统都使用 UTF-8。页面会对路径进行 URL 编码，服务器会进行解码。

### 修改 CSS 或 JavaScript 后没有生效

提高 index.html 中的版本参数：

~~~html
<link rel="stylesheet" href="/style.css?2026091602">
<script src="/script.js?2026091602" defer></script>
~~~

然后强制刷新浏览器。

---

## 安全建议

- 不要将 SSH、SFTP 或服务器管理端口直接暴露到公网。
- 生产环境应使用 HTTPS。
- 不建议以 root 用户长期运行 Node.js 服务。
- 不要将密码、API Key、私钥或内部配置文件放入 files。
- 定期备份 files 和服务器配置。
- 对公开上传的文件进行安全扫描。
- 建议通过反向代理限制单个 IP 的下载频率和并发连接数。
- 如果需要区分公开资源和内部资源，应增加登录鉴权，而不是依赖隐藏文件名。

---

## 常见维护流程

### 发布一个新版本

1. 按照命名规范准备文件。
2. 上传到 files 中的对应目录。
3. 打开网页并确认文件、大小和更新时间正确。
4. 使用搜索功能验证文件可以被检索。
5. 下载文件并校验哈希值。
6. 如有必要，更新 Wiki 或产品公告中的下载链接。

### 下架一个旧版本

1. 先将文件备份到归档存储。
2. 从 files 中删除旧文件。
3. 刷新下载中心确认文件已消失。
4. 检查 Wiki 或其他页面是否仍引用旧文件。

---

## 许可与支持

本项目用于 iKOOLCORE 技术资源发布与维护。

- 官方网站：https://www.ikoolcore.com/
- 技术 Wiki：https://wiki.ikoolcore.com/
- 社区支持：https://discord.gg/ddHdeSkE
