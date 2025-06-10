import ffmpeg
import json


def getSettings():
    with open('settings.json', 'r') as file:
        data = json.load(file)
        return (data["ip-spycam"], data["ip-gamemastercam"])



def StartStream(ip, outputPath):
    
    try:
        ipSpycam, ipGamemastercam = getSettings()
        inputStream = ffmpeg.input(ip)
        outputStream = ffmpeg.output(inputStream, outputPath, format='hls', start_number=0, hls_time=5, hls_list_size=3, vcodec = "copy")
        ffmpeg.run(outputStream)
    except:
        pass



StartStream("rtsp:/127.0.0.1:8554", "public/Controller/Stream1/output.m3u8")    