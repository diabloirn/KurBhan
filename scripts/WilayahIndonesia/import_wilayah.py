import pandas as pd
import psycopg2
from psycopg2.extras import execute_batch

# Ganti dengan URI database Supabase Anda
DB_URI = "postgresql://postgres.wgyzpzdnublmqfirikab:Diabloirn16......@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"

# Daftar ID 2-digit provinsi di Pulau Jawa untuk pengisian flag is_java_island
JAVA_PROVINCES = ['31', '32', '33', '34', '35', '36']

def clean_id(val):
    return str(val).replace('.', '').strip()

try:
    print("Menghubungkan ke database Supabase...")
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()

    # 1. Import Provinsi (dtype=str memastikan format ID aman)
    print("1/4 Memproses & Mengunggah Data Provinsi...")
    df_prov = pd.read_csv('provinsi.csv', dtype=str)
    prov_data = [
        (clean_id(row['id']), str(row['name']).strip().upper(), clean_id(row['id']) in JAVA_PROVINCES)
        for _, row in df_prov.iterrows()
    ]
    execute_batch(cur, """
        INSERT INTO public.provinces (id, name, is_java_island)
        VALUES (%s, %s, %s) ON CONFLICT (id) DO NOTHING;
    """, prov_data)
    conn.commit()

    # 2. Import Kabupaten / Kota
    print("2/4 Memproses & Mengunggah Data Kabupaten/Kota...")
    df_kab = pd.read_csv('kabupaten_kota.csv', dtype=str)
    kab_data = [
        (clean_id(row['id']), clean_id(row['id'])[:2], str(row['name']).strip().upper())
        for _, row in df_kab.iterrows()
    ]
    execute_batch(cur, """
        INSERT INTO public.regencies (id, province_id, name)
        VALUES (%s, %s, %s) ON CONFLICT (id) DO NOTHING;
    """, kab_data)
    conn.commit()

    # 3. Import Kecamatan
    print("3/4 Memproses & Mengunggah Data Kecamatan...")
    df_kec = pd.read_csv('kecamatan.csv', dtype=str)
    kec_data = [
        (clean_id(row['id']), clean_id(row['id'])[:4], str(row['name']).strip().upper())
        for _, row in df_kec.iterrows()
    ]
    execute_batch(cur, """
        INSERT INTO public.districts (id, regency_id, name)
        VALUES (%s, %s, %s) ON CONFLICT (id) DO NOTHING;
    """, kec_data, page_size=1000)
    conn.commit()

    # 4. Import Kelurahan / Desa
    print("4/4 Memproses & Mengunggah Data Kelurahan/Desa (83k+ Data)...")
    df_kel = pd.read_csv('kelurahan.csv', dtype=str)
    kel_data = [
        (clean_id(row['id']), clean_id(row['id'])[:6], str(row['name']).strip().upper())
        for _, row in df_kel.iterrows()
    ]
    execute_batch(cur, """
        INSERT INTO public.villages (id, district_id, name)
        VALUES (%s, %s, %s) ON CONFLICT (id) DO NOTHING;
    """, kel_data, page_size=2000)
    conn.commit()

    cur.close()
    conn.close()
    print("\n Selesai! Seluruh data 38 provinsi hingga kelurahan berhasil di-import ke Supabase.")

except Exception as e:
    print(f"\n Terjadi kesalahan saat mengunggah data: {e}")