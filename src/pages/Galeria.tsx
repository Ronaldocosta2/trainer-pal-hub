import { useState, useEffect } from 'react';
import { useAlunos } from '@/hooks/useAlunos';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImagePlus, Images, Trash2 } from 'lucide-react';

interface StudentGallery {
    antes: string | null;
    depois: string | null;
}

export default function Galeria() {
    const { data: alunos = [] } = useAlunos();
    const [selectedAlunoId, setSelectedAlunoId] = useState<string>('');
    const [gallery, setGallery] = useState<StudentGallery>({ antes: null, depois: null });

    // Carrega as fotos do localStorage quando mudar de aluno
    useEffect(() => {
        if (selectedAlunoId) {
            const stored = localStorage.getItem(`galeria_${selectedAlunoId}`);
            if (stored) {
                setGallery(JSON.parse(stored));
            } else {
                setGallery({ antes: null, depois: null });
            }
        } else {
            setGallery({ antes: null, depois: null });
        }
    }, [selectedAlunoId]);

    // Salva no localStorage sempre que 'gallery' mudar para um aluno
    useEffect(() => {
        if (selectedAlunoId) {
            if (gallery.antes || gallery.depois) {
                localStorage.setItem(`galeria_${selectedAlunoId}`, JSON.stringify(gallery));
            } else {
                localStorage.removeItem(`galeria_${selectedAlunoId}`); // Limpa se vazio
            }
        }
    }, [gallery, selectedAlunoId]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'antes' | 'depois') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Str = event.target?.result as string;
            setGallery(prev => ({ ...prev, [type]: base64Str }));
        };
        reader.readAsDataURL(file);
        // Limpa o input para permitir upload da mesma foto novamente se excluiu
        e.target.value = '';
    };

    const clearImage = (type: 'antes' | 'depois') => {
        setGallery(prev => ({ ...prev, [type]: null }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Galeria do Aluno</h1>
                <p className="text-muted-foreground">Registre o progresso (Antes e Depois) dos seus alunos.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Selecionar Aluno</CardTitle>
                    <CardDescription>Escolha um aluno para visualizar ou adicionar fotos de evolução.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-w-md">
                        <Select value={selectedAlunoId} onValueChange={setSelectedAlunoId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um aluno..." />
                            </SelectTrigger>
                            <SelectContent>
                                {alunos.filter(a => a.ativo).map((aluno) => (
                                    <SelectItem key={aluno.id} value={aluno.id}>
                                        {aluno.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {selectedAlunoId ? (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* ANTES */}
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="flex justify-between items-center text-lg">
                                Antes
                                {gallery.antes && (
                                    <Button variant="ghost" size="icon" onClick={() => clearImage('antes')} className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
                            {gallery.antes ? (
                                <div className="relative w-full h-full flex flex-col items-center">
                                    <img src={gallery.antes} alt="Antes" className="max-h-[500px] w-auto max-w-full rounded-md object-contain shadow-sm border" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground w-full h-[300px] border-2 border-dashed rounded-lg bg-muted/10">
                                    <ImagePlus className="h-10 w-10 opacity-50" />
                                    <p className="text-sm">Nenhuma foto adicionada</p>
                                    <Label htmlFor="upload-antes" className="cursor-pointer">
                                        <Button variant="secondary" className="pointer-events-none">Fazer Upload</Button>
                                    </Label>
                                    <Input
                                        id="upload-antes"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e, 'antes')}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* DEPOIS */}
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="flex justify-between items-center text-lg">
                                Depois
                                {gallery.depois && (
                                    <Button variant="ghost" size="icon" onClick={() => clearImage('depois')} className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
                            {gallery.depois ? (
                                <div className="relative w-full h-full flex flex-col items-center">
                                    <img src={gallery.depois} alt="Depois" className="max-h-[500px] w-auto max-w-full rounded-md object-contain shadow-sm border shadow-primary/20" />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground w-full h-[300px] border-2 border-dashed rounded-lg bg-muted/10">
                                    <ImagePlus className="h-10 w-10 opacity-50" />
                                    <p className="text-sm">Nenhuma foto adicionada</p>
                                    <Label htmlFor="upload-depois" className="cursor-pointer">
                                        <Button variant="secondary" className="pointer-events-none">Fazer Upload</Button>
                                    </Label>
                                    <Input
                                        id="upload-depois"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e, 'depois')}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <Card className="border-dashed h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                    <Images className="h-12 w-12 mb-4 opacity-20" />
                    <p>Selecione um aluno acima para visualizar a galeria.</p>
                </Card>
            )}
        </div>
    );
}
