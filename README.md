# Sesli Kitap V2.6 — Okur TTS doğrudan entegrasyon denemesi

Bu paket **V2.4 kararlı sürüm** üzerine Okur TTS ses motorunu ekler. V2.5'in kopyala/yapıştır işlevleri yer almaz. PDF cihazda yerel olarak saklanmaya devam eder.

## Kurulum

GitHub deponuzda mevcut dosyaları yükleyip `okur/` klasörünü **klasör yapısı bozulmadan** ekleyin. `okur/models/`, `okur/ort/`, `okur/assets/` dizinleri ve `okur/models.json` aynı konumda olmalı. Bu dosyalar yaklaşık 40 MB yer kaplar. GitHub Pages altında `/seslikitap/` alt yolunda çalışması için worker yolları düzenlenmiştir.

## Kullanım

Okuyucu > Anlatıcı Sesi > **Okur — Doğal Türkçe (cihazda)**. `▶ Oku` ile sayfadaki cümleler sırayla üretilip oynatılır. Mevcut tarayıcı sesleri de korunur. İlk model indirme internet gerektirir; tarayıcı depolama politikaları nedeniyle daha sonra çevrimdışı çalışma garanti edilmez. Sayfa yenilenince modeller yeniden yüklenebilir. iPhone Safari için henüz gerçek test yapılmamıştır. Üretilen ses dosyalarını kalıcı saklama henüz eklenmemiştir.

## Test önerileri

1. Önce bir test dalında veya farklı yayın adresinde deneyin. Çalışan siteyi yedekleyin.
2. Tarayıcı geliştirici araçlarında Network sekmesinden `okur/models.json`, `okur/models/*.onnx`, `okur/ort/1.30.0/*.wasm` isteklerinin 200 döndürdüğünü doğrulayın.
3. Kısa PDF, sonra çok sayfalı PDF ile test edin. iPhone Safari'de uzun süreli okuma ve kilit ekranı ayrıca test edilmelidir.

## Lisans

Okur kaynak kodu Apache-2.0, model lisansı CC BY 4.0; paket içindeki `OKUR-LICENSE.txt`, `OKUR-NOTICE.txt`, `OKUR-MODEL-CARD.md` içeriklerini koruyun ve uygun atıf verin. Orijinal kaynak: https://github.com/ahmethakanbesel/okur-tts ve https://huggingface.co/ahakan/okur-tts

## Notlar

Bu entegrasyon geliştirme/test sürümüdür. Derleme paketinin tamamı buradadır ancak bu ortamda gerçek Safari/Chrome testi yapılamadığı için çalışması doğrulanmış bir sürüm olarak sunulmamaktadır. CORS izolasyonu olmadan model tek iş parçacığında çalışacak şekilde yapılandırılmıştır; özellikle iPhone belleği kısıtlayıcı olabilir. GitHub Pages'te alt yol için derlenmiş worker'ın model ve ONNX Runtime URL'leri değiştirilmiştir.
