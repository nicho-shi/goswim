# 修复 gcloud PATH 问题

## 问题
如果在终端中运行 `gcloud` 命令时提示 "command not found"，说明 gcloud 的路径还没有添加到 PATH 中。

## 快速修复

### 方法 1: 重新打开终端（最简单）

如果刚刚安装完 Google Cloud SDK，**最简单的方法就是重新打开终端窗口**。

### 方法 2: 手动添加 PATH

运行以下命令检查 gcloud 的安装位置：

```bash
# 检查可能的安装位置
ls -la ~/google-cloud-sdk/bin/gcloud
ls -la /usr/local/bin/gcloud
ls -la /opt/homebrew/bin/gcloud
```

找到后，添加到 PATH（临时，仅当前终端会话有效）：

```bash
export PATH=$PATH:$HOME/google-cloud-sdk/bin
```

### 方法 3: 永久添加到 PATH

编辑 shell 配置文件：

**如果使用 zsh（macOS 默认）:**
```bash
echo 'export PATH=$PATH:$HOME/google-cloud-sdk/bin' >> ~/.zshrc
source ~/.zshrc
```

**如果使用 bash:**
```bash
echo 'export PATH=$PATH:$HOME/google-cloud-sdk/bin' >> ~/.bashrc
source ~/.bashrc
```

### 方法 4: 使用官方安装脚本（会自动配置）

如果还没安装，使用官方脚本会自动配置 PATH：

```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL  # 重新加载 shell
```

## 验证安装

```bash
gcloud --version
```

应该显示类似：
```
Google Cloud SDK 450.0.0
...
```

## 验证后可继续部署

确认 `gcloud --version` 正常工作后，运行：

```bash
./start_deploy.sh
```
