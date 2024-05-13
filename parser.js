function parseAttributes(line) {
  const attributes = {}
  const regex = /([A-Z0-9\-]+)=("[^"]*"|[^,]*)/gi
  let match

  while ((match = regex.exec(line)) !== null) {
    attributes[match[1]] = match[2].replace(/(^"|"$)/g, '')
  }

  return attributes
}

function parseMasterPlaylist(data) {
  const lines = data.split(/\r?\n/)
  const playlists = []
  let currentStream = null

  lines.forEach((line) => {
    line = line.trim()
    if (line.startsWith('#EXT-X-STREAM-INF')) {
      currentStream = {
        attributes: parseAttributes(line),
        uri: null,
      }
    } else if (line && !line.startsWith('#')) {
      if (currentStream) {
        currentStream.uri = line
        playlists.push(currentStream)
        currentStream = null
      }
    }
  })

  return { playlists }
}

function parseMediaPlaylist(data) {
  const lines = data.split(/\r?\n/)
  const segments = []
  let currentSegment = null
  let targetDuration = 0
  let mediaSequence = 0

  lines.forEach((line) => {
    line = line.trim()
    if (line.startsWith('#EXTINF')) {
      const duration = parseFloat(line.split(':')[1])
      currentSegment = {
        duration,
        uri: null,
      }
    } else if (line.startsWith('#EXT-X-TARGETDURATION')) {
      targetDuration = parseInt(line.split(':')[1], 10)
    } else if (line.startsWith('#EXT-X-MEDIA-SEQUENCE')) {
      mediaSequence = parseInt(line.split(':')[1], 10)
    } else if (line && !line.startsWith('#')) {
      if (currentSegment) {
        currentSegment.uri = line
        segments.push(currentSegment)
        currentSegment = null
      }
    }
  })

  return {
    targetDuration,
    mediaSequence,
    segments,
  }
}

function parseM3U8(data) {
  if (data.includes('#EXT-X-STREAM-INF')) {
    return parseMasterPlaylist(data)
  } else {
    return parseMediaPlaylist(data)
  }
}

// 예제 사용 방법
const m3u8Data = `
#EXTM3U
#EXT-X-VERSION:4
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio",NAME="und",DEFAULT=YES,AUTOSELECT=YES,LANGUAGE="und",CHANNELS="2"
#EXT-X-STREAM-INF:BANDWIDTH=175480,AVERAGE-BANDWIDTH=159204,CODECS="avc1.4D4015,mp4a.40.2",RESOLUTION=480x270,FRAME-RATE=23.976,AUDIO="audio"
SDR_AVC/LD_150K/TS/KO/240207184000/chunklist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=284440,AVERAGE-BANDWIDTH=248547,CODECS="avc1.4D4015,mp4a.40.2",RESOLUTION=480x270,FRAME-RATE=23.976,AUDIO="audio"
SDR_AVC/LD_250K/TS/KO/240207184000/chunklist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=747832,AVERAGE-BANDWIDTH=596288,CODECS="avc1.4D401E,mp4a.40.2",RESOLUTION=640x360,FRAME-RATE=23.976,AUDIO="audio"
SDR_AVC/LD_500K/TS/KO/240207184000/chunklist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1428988,AVERAGE-BANDWIDTH=1164686,CODECS="avc1.4D401E,mp4a.40.2",RESOLUTION=854x480,FRAME-RATE=23.976,AUDIO="audio"
SDR_AVC/SD_1M/TS/KO/240207184000/chunklist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2513148,AVERAGE-BANDWIDTH=2077486,CODECS="avc1.64001F,mp4a.40.2",RESOLUTION=1280x720,FRAME-RATE=23.976,AUDIO="audio"
SDR_AVC/HD_2M/TS/KO/240207184000/chunklist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5702040,AVERAGE-BANDWIDTH=5015712,CODECS="avc1.640028,mp4a.40.2",RESOLUTION=1920x1080,FRAME-RATE=23.976,AUDIO="audio"
SDR_AVC/FHD_5M/TS/KO/240207184000/chunklist.m3u8
`

const parsedPlaylist = parseM3U8(m3u8Data)
console.dir(parsedPlaylist, { depth: null, colors: true })
