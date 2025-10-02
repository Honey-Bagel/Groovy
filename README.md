# Groovy - Discord Music Bot

![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![Discord.js](https://img.shields.io/badge/discord.js-v14-blue.svg)
![DisTube](https://img.shields.io/badge/distube-v5-purple.svg)
![MongoDB](https://img.shields.io/badge/mongodb-latest-green.svg)

A feature-rich Discord music bot built with Discord.js v14 and DisTube, offering high-quality audio streaming, playlist management, and real-time queue visualization with an intuitive command system supporting both prefix and slash commands.

## Overview

Groovy is a production-ready Discord music bot that provides seamless music playback from multiple sources including YouTube, Spotify, Apple Music, and direct links. The bot features advanced queue management, audio filters, auto-resume functionality, and a sophisticated permission system for server administrators.

## Key Features

### Music Playback
- **Multi-Source Support**: Stream from YouTube, Spotify, Apple Music, and direct audio links
- **High-Quality Audio**: Utilizes yt-dlp for optimal audio quality and reliability
- **Smart Caching**: Efficient cookie-based YouTube authentication for uninterrupted playback
- **Live Stream Support**: Compatible with live audio streams

### Queue Management
- **Interactive Queue Display**: Paginated queue interface with navigation buttons
- **Real-Time Updates**: Live queue modifications reflected instantly across all users
- **Advanced Controls**: Skip, jump, move, shuffle, and remove songs with granular control
- **Auto-Resume**: Automatically resumes playback after bot restarts (configurable per server)
- **Previous Track**: Navigate backwards through playback history

### Audio Enhancement
- **30+ Audio Filters**: Bass boost, nightcore, vaporwave, 8D audio, and more
- **Custom Speed Control**: Adjustable playback speed from 0.5x to 2x
- **Filter Stacking**: Apply multiple filters simultaneously
- **Real-Time Processing**: Filters applied without interrupting playback

### Advanced Features
- **Dual Command System**: Both prefix commands and slash commands fully supported
- **Now Playing Display**: Auto-updating embeds showing current track, progress, and queue stats
- **Autoplay Mode**: Automatically plays related songs when queue ends
- **Loop Modes**: Loop single track, entire queue, or disable looping
- **Volume Control**: Per-server volume settings with customizable maximum limits
- **Seek Controls**: Fast-forward, rewind, and seek to specific timestamps

### Server Configuration
- **Customizable Prefix**: Set per-server command prefixes
- **Default Settings**: Configure default volume, autoplay, and filters per server
- **Auto-Delete Messages**: Configurable message cleanup for bot and user commands
- **Permission System**: Role-based and user-based command restrictions
- **Status Rotation**: Dynamic bot status with support for multiple activities

## Technical Architecture

### Command System
The bot implements a unified command handler that supports both traditional prefix commands and Discord's slash commands. Commands are organized into logical categories:

- **Music**: Core playback controls (play, pause, resume, stop, leave)
- **Queue**: Queue manipulation (skip, jump, shuffle, clear, remove, move)
- **Song**: Track-specific controls (seek, forward, rewind, replay, speed)
- **Filter**: Audio processing (add, remove, set, clear, list filters)
- **Settings**: Server configuration (prefix, volume, autoplay, filters)
- **Info**: Bot information and help commands

### Database Design
MongoDB schemas handle persistent data:

**Settings Schema**
- Server-specific configurations (prefix, volumes, default behaviors)
- Message deletion preferences
- Custom playlists storage

**Autoresume Schema**
- Voice/text channel IDs
- Complete queue state with timestamps
- Playback position for seamless restoration
- Filter and loop mode preservation

**Status Schema**
- Rotating status messages
- Activity type configuration (Playing, Watching, Listening, Competing)

### Real-Time Features
Socket.IO-inspired architecture manages live updates:
- **MusicHandler Singleton**: Centralized state management for all guilds
- **Interval-Based Updates**: Now-playing messages update every 5 seconds
- **Button Interactions**: Paginated queue navigation using Discord buttons
- **Auto-Save**: Queue state persisted every 5 seconds for crash recovery

### Error Handling
Comprehensive error handling system:
- **Anti-Crash Module**: Catches unhandled rejections and exceptions
- **Graceful Degradation**: Falls back to default behaviors on failures
- **User-Friendly Messages**: Clear error communication with suggested solutions
- **Debug Logging**: Detailed console output for troubleshooting

## Command Reference

### Music Commands
- `play <song/url>` - Play a song from search term or URL
- `pause` - Pause current playback
- `resume` - Resume paused playback
- `stop` - Stop playback and clear queue
- `leave` - Disconnect bot from voice channel

### Queue Commands
- `queue` / `list` - Display current queue with pagination
- `skip` - Skip to next song
- `previous` - Play previous song
- `jump <position>` - Jump to specific song in queue
- `shuffle` - Randomize queue order
- `unshuffle` - Restore original queue order
- `clear` - Remove all songs from queue
- `remove <position> [count]` - Remove specific songs
- `move <from> <to>` - Reorder songs in queue
- `loop <song/queue/off>` - Set loop mode
- `autoplay` - Toggle autoplay mode

### Audio Control Commands
- `volume <0-200>` - Set playback volume
- `seek <seconds>` - Seek to timestamp
- `forward <seconds>` - Skip forward
- `rewind <seconds>` - Skip backward
- `replay` - Restart current song
- `speed <value>` - Adjust playback speed

### Filter Commands
- `addfilter <filters>` - Add audio filters (comma-separated)
- `removefilter <filters>` - Remove specific filters
- `setfilter <filters>` - Override with new filters
- `clearfilters` - Remove all active filters
- `listfilters` - Show available and active filters

### Configuration Commands (Requires Manage Guild)
- `prefix <character>` - Change server command prefix
- `defaultvolume <value>` - Set default starting volume
- `maxvolume <value>` - Set maximum allowed volume
- `defaultautoplay <true/false>` - Set default autoplay state
- `defaultfilter <filters>` - Set filters applied on playback start
- `autoresume <true/false>` - Enable/disable auto-resume on restart

### Information Commands
- `help [command]` - Show command list or specific command info
- `botinfo` - Display bot statistics and system information
- `invite` - Get bot invite link

## Technology Stack

### Core Dependencies
- **discord.js v14**: Modern Discord API wrapper with full slash command support
- **DisTube v5**: Robust music streaming library with plugin architecture
- **MongoDB/Mongoose**: Document database for persistent storage
- **Node.js**: JavaScript runtime environment

### DisTube Plugins
- **@distube/spotify**: Spotify playlist and track support with API integration
- **@distube/youtube**: Enhanced YouTube integration with cookie support
- **@distube/yt-dlp**: Powerful media extraction for maximum compatibility
- **@distube/direct-link**: Support for direct MP3/audio file URLs
- **distube-apple-music**: Apple Music playlist integration

### Audio Processing
- **@discordjs/opus**: Opus audio codec for voice transmission
- **@discordjs/voice**: Voice connection management
- **FFmpeg filters**: Real-time audio manipulation (bass boost, pitch shift, etc.)

### Utilities
- **colors**: Colorized console logging for better debugging
- **dotenv**: Environment variable management
- **cpu-stat**: System resource monitoring
- **nodemon**: Development auto-restart on file changes

## Project Structure

```
groovy/
├── commands/
│   ├── filter/          # Audio filter commands
│   ├── info/            # Information commands
│   ├── music/           # Core playback commands
│   ├── queue/           # Queue management commands
│   ├── settings/        # Server configuration commands
│   └── song/            # Track-specific commands
├── configs/
│   ├── config.json      # Bot configuration
│   ├── embed.json       # Embed styling
│   ├── emojis.json      # Custom emoji mappings
│   ├── filters.json     # FFmpeg filter definitions
│   └── settings.json    # Default settings
├── controllers/
│   ├── AutoresumeController.js   # Auto-resume data access
│   └── SettingController.js      # Settings data access
├── events/
│   ├── client/          # Discord client events
│   ├── distube/         # DisTube music events
│   └── guild/           # Guild-specific events
├── handlers/
│   ├── commandHandler.js         # Command loader
│   ├── slashCommandHandler.js    # Slash command registration
│   ├── eventHandler.js           # Event loader
│   ├── distubeEvents.js          # DisTube event loader
│   ├── dbHandler.js              # Database connection
│   ├── musicHandler.js           # Music state management
│   ├── autoresume.js             # Auto-resume logic
│   ├── antiCrash.js              # Error recovery
│   └── functions.js              # Utility functions
├── models/
│   ├── Autoresume.js    # Auto-resume schema
│   ├── Settings.js      # Server settings schema
│   └── Status.js        # Bot status schema
├── utils/
│   └── commandUtils.js  # Unified command utilities
├── index.js             # Application entry point
└── package.json         # Dependencies and scripts
```

## Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
TOKEN=your_discord_bot_token
MONGO_URI=your_mongodb_connection_string
SPOTIFY_CLIENTID=your_spotify_client_id
SPOTIFY_SECRET=your_spotify_client_secret
YT_COOKIES=[{"name":"cookie_name","value":"cookie_value"}]
NODE_ENV=production
```

### Bot Configuration
Edit `configs/config.json`:

```json
{
  "prefix": "-",
  "spotify_api": {
    "enabled": true
  },
  "loadSlashCommandsGlobal": true
}
```

### Permissions Required
The bot requires the following Discord permissions:
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Add Reactions
- Use Slash Commands
- Connect to Voice
- Speak in Voice
- Use Voice Activity

## Key Design Decisions

### Unified Command System
Rather than maintaining separate codebases for prefix and slash commands, the bot uses a unified command handler with a context wrapper that abstracts the differences. This reduces code duplication and ensures feature parity between both command types.

### Singleton Pattern for Music Handler
The MusicHandler class uses the singleton pattern to maintain a single source of truth for music state across the entire bot. This prevents race conditions and ensures consistent state management across multiple guilds.

### Auto-Resume Architecture
The auto-resume system periodically saves queue state to the database every 5 seconds. On restart, it reconstructs the queue and seeks to the saved timestamp, providing a seamless experience even after crashes or maintenance.

### Pagination Strategy
Queue pagination uses Discord's button components rather than reaction-based navigation, providing a more modern and responsive user experience with proper disabled states and page indicators.

### Filter System Design
Audio filters are defined in a centralized JSON configuration file and applied as FFmpeg filter chains. This allows for easy addition of new filters without modifying code and supports complex filter combinations.

## Performance Considerations

- **Lazy Loading**: Commands and events are loaded dynamically at startup
- **Efficient Database Queries**: Mongoose schemas optimized with proper indexing
- **Memory Management**: Interval cleanup and proper event listener removal
- **Connection Pooling**: MongoDB connection reuse across requests
- **Voice Optimization**: Automatic deafening to reduce bandwidth usage

## Development Notes

### Command Creation Template
All commands follow a consistent structure:

```javascript
module.exports = {
  name: "commandname",
  usage: "commandname <args>",
  aliases: ["alias1", "alias2"],
  description: "Command description",
  memberpermissions: ["ManageGuild"], // Optional
  requiredroles: [], // Optional
  alloweduserids: [], // Optional
  data: new SlashCommandBuilder()
    .setName("commandname")
    .setDescription("Command description"),
  
  execute: async (client, message, args) => {
    return executeCommand(client, { message, args });
  },
  
  executeSlash: async (client, interaction) => {
    return executeCommand(client, { interaction });
  }
};

async function executeCommand(client, context) {
  // Unified command logic
}
```

### Adding New Audio Filters
Add filter definitions to `configs/filters.json`:

```json
{
  "filtername": "ffmpeg_filter_string",
  "customecho": "aecho=0.8:0.9:1000:0.3"
}
```

### Event Handler Pattern
All events follow a standardized structure:

```javascript
module.exports = {
  name: Events.EventName,
  once: false, // or true for one-time events
  execute: async (client, ...args) => {
    // Event handling logic
  }
};
```

## Known Limitations

- Cookie-based YouTube authentication requires periodic manual updates
- Spotify track streaming depends on YouTube fallback (no direct Spotify playback)
- Maximum queue size limited by available memory
- Voice connection requires stable network connectivity
- Filter application causes brief audio interruption

## Future Enhancement Opportunities

- Implement queue export/import functionality
- Add support for custom playlists with CRUD operations
- Develop web dashboard for real-time queue visualization
- Implement voting system for skip/remove actions
- Add lyrics fetching and display
- Support for additional audio sources (SoundCloud, Bandcamp)
- Implement DJ role with elevated permissions
- Add queue saving across sessions per user
- Support for voice channel stage announcements
